import json
import psycopg2
from psycopg2 import sql

# --- Configuration ---
DATABASE_URL = "dbname=webapp_bot user=postgres password=1111 host=localhost"
JSONL_FILE_PATH = "A:\WebApp-TelegramBot\webapp_telegrambot\scripts\sample.jsonl"

# --- Helper Functions for Data Cleaning ---

def clean_author_name(name):
    """
    Applies the necessary cleaning and normalization steps to an author name.
    1. Removes (Author), (Editor), etc. suffixes.
    2. Removes trailing punctuation.
    3. Normalizes spacing around initials (e.g., J. R. R. Tolkien -> J.R.R. Tolkien).
    """
    if not name:
        return None

    # 1. Remove common suffixes (case-insensitive)
    suffixes = [
        " (Author)", " (Editor)", " (Contributor)", " (Illustrator)",
        " (Translator)", " (Creator)", " (Narrator)", " (Photographer)"
    ]
    for suffix in suffixes:
        if name.lower().endswith(suffix.lower()):
            name = name[:-len(suffix)]
            break # Assume only one role suffix

    # 2. Remove trailing punctuation
    name = name.rstrip('.,; ')

    # 3. Normalize spacing around initials (J. R. R. -> J.R.R.)
    # Replace single-space-period-space with single-period for initials.
    # We'll normalize to remove all spaces between initials and periods first, then trim.
    name = name.replace('. ', '.').replace(' .', '.')
    
    # Final trim and consistent case (Title Case is often good, but we stick to cleaning for uniqueness)
    name = name.strip()
    return name

def parse_authors_from_store(store_string):
    """
    Parses a string like 'Author1 (Author), Author2 (Editor)' into a list of names.
    """
    if not store_string:
        return []
    
    # Split by comma (handles multiple names)
    names = [part.strip() for part in store_string.split(',')]
    return [name for name in names if name] # Filter out any empty names

# --- Main ETL Logic ---

def run_etl():
    """
    Runs the ETL process: Filtering, Cleaning, and Loading data.
    """
    print(f"Starting ETL process on {JSONL_FILE_PATH}...")
    
    # Connect to the database
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = False # Use manual transactions
        cursor = conn.cursor()
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return

    # --- Pre-load lookups (optional, but faster for smaller datasets) ---
    # Since we cannot pre-load all 20GB of authors, we rely on the DB UNIQUE constraint.
    # However, we can track categories easily.
    category_map = {} # {category_name: category_id}
    
    # --------------------------------------------------------------------
    
    inserted_books_count = 0
    
    try:
        with open(JSONL_FILE_PATH, 'r', encoding='utf-8') as f:
            for line_number, line in enumerate(f):
                if line_number % 10000 == 0 and line_number > 0:
                    print(f"Processed {line_number} records. Inserted {inserted_books_count} books.")
                    conn.commit() # Commit transaction periodically

                try:
                    record = json.loads(line.strip())
                except json.JSONDecodeError:
                    print(f"Skipping line {line_number}: Invalid JSON.")
                    continue

                # --- 1. FILTERING ---
                
                # Filter 1: main_category must be 'Books'
                if record.get('main_category') != 'Books':
                    continue

                # Filter 2: Language must be 'English' (check details)
                if record.get('details', {}).get('Language') != 'English':
                    continue
                
                # Check for essential fields
                parent_asin = record.get('parent_asin')
                if not parent_asin:
                    continue

                # --- 2. TRANSFORMATION & LOADING (Authors) ---
                
                # Collect all potential author names
                raw_author_names = set()

                # A. Get primary author name
                primary_author = record.get('author', {}).get('name')
                if primary_author:
                    raw_author_names.add(primary_author)
                    
                # B. Get names from the 'store' field
                store_authors = parse_authors_from_store(record.get('store'))
                for name in store_authors:
                    raw_author_names.add(name)
                
                # Process and link authors
                book_author_ids = []
                for raw_name in raw_author_names:
                    canonical_name = clean_author_name(raw_name)
                    if not canonical_name:
                        continue
                    
                    author_avatar = record.get('author', {}).get('avatar')
                    print()
                    if canonical_name == primary_author:
                        author_about = json.dumps(record.get('author', {}).get('about', [])) # Store 'about' as JSON string/TEXT
                    else:
                        author_about = None # No 'about' info for secondary authors
                        
                    try:
                        # Attempt to INSERT the author (Will fail if UNIQUE constraint violated)
                        cursor.execute(
                            """
                            INSERT INTO authors (name, avatar_url, about)
                            VALUES (%s, %s, %s)
                            ON CONFLICT (name) DO NOTHING
                            RETURNING author_id;
                            """,
                            (canonical_name, author_avatar, author_about)
                        )
                        result = cursor.fetchone()
                        
                        if result:
                            author_id = result[0]
                        else:
                            # If INSERT failed (CONFLICT), SELECT the existing ID
                            cursor.execute(
                                "SELECT author_id FROM authors WHERE name = %s;",
                                (canonical_name,)
                            )
                            author_id = cursor.fetchone()[0]
                            
                        book_author_ids.append(author_id)
                        
                    except Exception as e:
                        # Handle unexpected DB errors (not just unique constraint)
                        print(f"DB Error processing author {canonical_name}: {e}. Skipping book.")
                        conn.rollback() # Rollback current book transaction
                        continue

                # --- 3. TRANSFORMATION & LOADING (Book) ---

                # Prepare fields for books table
                book_data = {
                    'parent_asin': parent_asin,
                    'main_category': record.get('main_category'),
                    'title': record.get('title'),
                    'subtitle': record.get('subtitle'),
                    'average_rating': record.get('average_rating'),
                    'rating_number': record.get('rating_number'),
                    'price': record.get('price'),
                    # Concatenate array fields into single TEXT fields
                    'features': '\n---\n'.join(record.get('features', [])),
                    'description': '\n---\n'.join(record.get('description', [])),
                    # Use JSONB for unstructured fields
                    'details_jsonb': json.dumps(record.get('details')),
                    'videos_jsonb': json.dumps(record.get('videos', [])),
                }

                # Insert into books table
                try:
                    cursor.execute(
                        """
                        INSERT INTO books (
                            parent_asin, main_category, title, subtitle, 
                            average_rating, rating_number, price, features, 
                            description, details_jsonb, videos_jsonb
                        ) VALUES (
                            %(parent_asin)s, %(main_category)s, %(title)s, %(subtitle)s, 
                            %(average_rating)s, %(rating_number)s, %(price)s, %(features)s, 
                            %(description)s, %(details_jsonb)s, %(videos_jsonb)s
                        );
                        """,
                        book_data
                    )
                    inserted_books_count += 1
                except Exception as e:
                    # Catch book insertion errors (e.g., duplicate ASIN)
                    print(f"DB Error inserting book {parent_asin}: {e}. Skipping junction tables.")
                    conn.rollback()
                    continue

                # --- 4. LOADING (Junction Tables: book_authors, images, categories) ---
                
                # Insert book_authors links
                for author_id in book_author_ids:
                    cursor.execute(
                        """
                        INSERT INTO book_authors (book_id, author_id) VALUES (%s, %s)
                        ON CONFLICT DO NOTHING;
                        """,
                        (parent_asin, author_id)
                    )

                # Insert images
                for image in record.get('images', []):
                    cursor.execute(
                        "INSERT INTO images (book_id, large_url, variant) VALUES (%s, %s, %s);",
                        (parent_asin, image.get('large'), image.get('variant'))
                    )
                    
                # Insert categories (Lookup logic)
                for category_name in record.get('categories', []):
                    # Category lookup: Insert if new, get ID if exists
                    if category_name not in category_map:
                        cursor.execute(
                            "INSERT INTO categories (category_name) VALUES (%s) ON CONFLICT (category_name) DO UPDATE SET category_name=EXCLUDED.category_name RETURNING category_id;",
                            (category_name,)
                        )
                        category_id = cursor.fetchone()[0]
                        category_map[category_name] = category_id
                    else:
                        category_id = category_map[category_name]
                        
                    # Link book and category
                    cursor.execute(
                        "INSERT INTO book_categories (book_id, category_id) VALUES (%s, %s) ON CONFLICT DO NOTHING;",
                        (parent_asin, category_id)
                    )
                
                conn.commit() # Commit successful book processing
                
    except FileNotFoundError:
        print(f"Error: File not found at {JSONL_FILE_PATH}")
    except Exception as e:
        print(f"An unexpected error occurred during processing: {e}")
        conn.rollback() # Rollback any pending transactions
    finally:
        if conn:
            conn.close()
            print("\nETL process finished. Database connection closed.")
            print(f"Total books successfully inserted: {inserted_books_count}")

if __name__ == "__main__":
    run_etl()