import re
import requests
from django.db import transaction
from ..models import Book, Author, BookAuthor, BookCategory, Category
from ..serializers import BookSerializer
from datetime import datetime
OPEN_LIBRARY_BASE_URL = "https://openlibrary.org"


# --- START: New Subject Filtering Logic ---
# 1. Define Exclusions and Mappings
EXCLUSION_PATTERNS = [
    # General LCSH qualifiers to drop
    r"--\s*(?:History|Social life|Biography|Pictorial works|Sources|Congresses|Collections|Juvenile)",
    # Audience/Format/Metadata
    r"century", "children's", "electronic books", "ebooks", "textbooks",
    r"\d{4} - \d{4}", # Date ranges
    r"open library", r"gift books", # Open Library internal tags
    r"nytt?:", r"bisac", r"lcsh", # Cataloging/List identifiers
    r"pr\d+.\d+", r"^\d{3}\/?\.?\d*$", # Dewey Decimal / LC Call numbers (e.g., 823/.912)
    # Fictitious Characters or Places
    r"\(fictitious character\)", r"\(imaginary place\)", r"baggins", r"gandalf", r"hobbits",
    r"lord of the rings", r"middle earth", r"terre du milieu", # Specific title/setting references
    r"literature", r"language", r"english", r"british and irish", # General language/literature
    # Non-genre descriptive terms
    r"novelles", r"romans", r"prose", r"qu\u00eate", r"quests"
]

GENRE_MAPPING = {
    "science fiction": "Science Fiction",
    "scifi": "Science Fiction",
    "fantasy fiction": "Fantasy",
    "fantasy": "Fantasy",
    "ficci\u00f3n fant\u00e1stica": "Fantasy", # Spanish Fantasy fiction
    "misterio": "Mystery/Thriller", # Spanish Mystery
    "mystery": "Mystery/Thriller",
    "thrillers": "Mystery/Thriller",
    "detective and private investigator stories": "Mystery/Thriller",
    "romance fiction": "Romance",
    "love stories": "Romance",
    "historical fiction": "Historical Fiction",
    "horror tales": "Horror",
    "ghost stories": "Horror",
    "biography": "Biography",
    "autobiographies": "Biography",
    "cookbooks": "Cooking",
    "cooking": "Cooking",
    "epic": "Epic",
    "paranormal": "Paranormal",
    "general": "General",
    "general fiction": "General Fiction"
}

def _clean_and_filter_subjects(raw_subjects: list, limit: int = 5) -> list:
    """
    Cleans, normalizes, and filters raw Open Library subjects into core genres.
    1. Splits comma/slash-separated items.
    2. Applies exclusion patterns.
    3. Normalizes terms to a standard genre name.
    """
    if not raw_subjects:
        return []

    processed_genres = set()
    
    # 1. Expand comma-separated and slash-separated subjects
    expanded_subjects = []
    for s in raw_subjects:
        s_str = str(s).lower().strip()
        # Handle comma-separated list (e.g., "Fiction, fantasy, general")
        if ',' in s_str:
            expanded_subjects.extend([p.strip() for p in s_str.split(',')])
        # Handle slash-separated (less common, but good to cover)
        elif '/' in s_str and not re.search(r'\d', s_str): # Avoid splitting dates/numbers
            expanded_subjects.extend([p.strip() for p in s_str.split('/')])
        else:
            expanded_subjects.append(s_str)

    for subject in expanded_subjects:
        # Step 2: Exclusion - Skip based on non-genre patterns
        is_excluded = False
        for pattern in EXCLUSION_PATTERNS:
            if re.search(pattern, subject):
                is_excluded = True
                break
        if is_excluded or not subject:
            continue
            
        # Step 3: Pattern Matching - Simplify LCSH (e.g., "robots -- fiction" -> "robots")
        simplified_subject = re.split(r'\s*--\s*', subject)[0].strip()
        
        # Step 4: Normalization and Whitelisting
        final_genre = GENRE_MAPPING.get(simplified_subject, simplified_subject)
        
        # Only keep 'Fiction' if it's the only word left, otherwise rely on a more specific genre
        if final_genre == 'fiction' or final_genre == 'ficción':
            # 'Fiction' is too broad, but useful if nothing else is found.
            processed_genres.add("Fiction")
            continue
        
        # Check if the genre is in our explicit map or is a reasonably long, non-generic term
        if final_genre in GENRE_MAPPING.values() or len(final_genre) > 4:
            # Capitalize for final output
            processed_genres.add(final_genre.title())

    # Convert set back to a list, sort, and truncate to the limit
    return sorted(list(processed_genres))[:limit]

# --- END: New Subject Filtering Logic ---


def _get_amazon_asin(book_data: dict) -> str or None: # type: ignore
    # First, try to extract from identifiers
    identifiers = book_data.get('identifiers', {})
    amazon_list = identifiers.get('amazon', []) if isinstance(identifiers, dict) else []
    amazon_asin = amazon_list[0] if amazon_list else None

    if amazon_asin:
        return amazon_asin

    # Fallback to source_records
    source_records = book_data.get('source_records', [])
    if not source_records:
        return None
        
    for record in source_records:
        if record.startswith("amazon:"):
            return record.split(':', 1)[-1]
            
    return None


def _map_and_save_book(ol_data: dict, author_names: list, subject_names: list, description: str, rating_number: int, average_rating: float) -> Book:
    """Maps Open Library Edition data to local models and saves them."""
    
    if ol_data.get('key', '').startswith('/books/'):
        book_data = ol_data
    else:
        raise ValueError("Invalid book data structure provided for mapping.")
    
    amazon_asin = _get_amazon_asin(book_data)
    isbn_10_list = book_data.get('isbn_13')
    isbn_13 = isbn_10_list[0] if isbn_10_list else None
    isbn_10_list = book_data.get('isbn_10')
    isbn_10 = isbn_10_list[0] if isbn_10_list else None
    
    if amazon_asin:
        parent_asin_key = amazon_asin
    elif isbn_13:
        parent_asin_key = isbn_13
    elif isbn_10:
        parent_asin_key = isbn_10
    else:
        book_key = book_data.get('key').split('/')[-1] if book_data.get('key') else None
        if not book_key:
             raise ValueError("Could not find any suitable unique ID for parent_asin.")
        parent_asin_key = f"{book_key}"    
    
    author_instances = []
    for author_name in author_names:
        author_instance, created = Author.objects.get_or_create(name=author_name, defaults={'name': author_name})
        author_instances.append(author_instance)
        
    category_instances = []
    # Use the cleaned subject_names
    for name in subject_names: 
        category_instance, created = Category.objects.get_or_create(category_name=name[:255])
        category_instances.append(category_instance)


    raw_publish_date = book_data.get('publish_date')
    
    publication_date = None # Initialize to None
    
    if raw_publish_date:
        clean_date = raw_publish_date.strip()
        try:
            publication_date = datetime.strptime(clean_date, '%Y-%m-%d').date()            
        except ValueError:
            try:
                publication_date = datetime.strptime(clean_date, '%Y').date()
            except ValueError:
                try:
                    match = re.search(r'\d{4}', clean_date)
                    if match:
                        year = match.group(0)
                        publication_date = datetime.strptime(f"{year}-01-01", '%Y-%m-%d').date()
                except Exception as e:
                    print(f"Failed to process date '{clean_date}': {e}")

    
    with transaction.atomic():
        book_instance, created = Book.objects.update_or_create(
            parent_asin=parent_asin_key,
            defaults={
                'title': book_data.get('full_title') or book_data.get('title', 'Unknown Title'),
                'features': description or None,
                'publication_date': publication_date,
                'isbn_13': isbn_13,
                'isbn_10': book_data.get('isbn_10', [None])[0] if book_data.get('isbn_10') else isbn_13,
                'average_rating': average_rating,
                'rating_number': rating_number,
                'main_category': 'Books'
            }
        )

        
        BookAuthor.objects.filter(book=book_instance).delete()
        book_authors_to_create = [
            BookAuthor(book=book_instance, author=author)
            for author in author_instances
        ]
        BookAuthor.objects.bulk_create(book_authors_to_create, ignore_conflicts=True)

        BookCategory.objects.filter(book=book_instance).delete()
        book_categories_to_create = [
            BookCategory(book=book_instance, category=category)
            for category in category_instances
        ]
        BookCategory.objects.bulk_create(book_categories_to_create, ignore_conflicts=True)
                 
        return book_instance

def get_full_edition_data(edition_key: str) -> dict | None:
    """Fetches full metadata for a specific Edition key (/books/OL...M)."""
    try:
        url = f"{OPEN_LIBRARY_BASE_URL}{edition_key}.json"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching edition data for {edition_key}: {e}")
        return None

def get_description_data(work_key: str) -> str or None: # type: ignore
    try: 
        url = f"{OPEN_LIBRARY_BASE_URL}{work_key}.json"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        work_data = response.json()
        description = work_data.get('description')
        if isinstance(description, dict):
            return description.get('value')
        elif isinstance(description, str):
            return description
        return None
    except requests.exceptions.RequestException as e:
        print(f"Error fetching description data for {work_key}: {e}")
        return None

def search_book_in_openlibrary(query: str, query_type: str) -> dict | None:
    """
    Step 1: Determines API route based on query_type.
    Step 2: Fetches data.
    Step 3: Maps and saves the full data.
    """   
    
    try:
            
        if query_type == 'title' or query_type == 'author' or query_type == 'isbn':             
            
            params = {
                query_type: query,
                'fields': 'key,title,author_name,editions,subject,source_records,ratings_average,ratings_count'
            }
            search_url = f"{OPEN_LIBRARY_BASE_URL}/search.json"
            
            search_response = requests.get(search_url, params=params, timeout=5)
            search_response.raise_for_status()
            search_data = search_response.json()
            
            if search_data.get('numFound', 0) == 0 or not search_data.get('docs'):
                return None # No work found
            
            first_doc = search_data['docs'][0]
            
            edition_docs = first_doc.get('editions', {}).get('docs')
            
            if not edition_docs:
                return None 
            
            edition_key = edition_docs[0].get('key') # The key is now the Edition Key (e.g., /books/OL51711484M)
            
            if not edition_key:
                 return None 

            ol_data = get_full_edition_data(edition_key)
            
            author_names = first_doc.get('author_name', ['Unknown Author'])
            
            subjects = first_doc.get('subject', [])
            subject_names = _clean_and_filter_subjects(subjects, limit=5)
            
            description = get_description_data(first_doc.get('key')) # first_doc key is the Work Key
            
            average_rating = first_doc.get('ratings_average',0.0)
            rating_number = first_doc.get('ratings_count', 0)
            
            if not ol_data:
                return None 
        
        else:
            return {"error": f"Invalid query_type: {query_type}"}

        new_book = _map_and_save_book(ol_data, author_names, subject_names, description, rating_number, average_rating)
        
        return BookSerializer(new_book).data

            
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
            return None 
        print(f"Open Library API HTTP Error: {e}")
        return {"error": "External API call failed or timed out."}
    except requests.exceptions.RequestException as e:
        print(f"Open Library API Error: {e}")
        return {"error": "External API call failed or timed out."}
    except Exception as e:
        print(f"Error during data processing: {e}")
        return {"error": "Error processing external book data."}