from django.db.models import Avg, Count
from library.models import Book 

def update_book_rating(book_pk):
    """Recalculates and updates the average_rating and rating_number for a Book."""
    try:
        book = Book.objects.get(pk=book_pk)
    except Book.DoesNotExist:
        return
    
    stats = book.reviews.aggregate(
        avg_rating=Avg('rating'),
        count_rating=Count('rating')  # Count non-null ratings
    )

    avg = stats['avg_rating']
    count = stats['count_rating']

    book.average_rating = round(avg, 2) if avg is not None else None
    book.rating_number = count if count is not None else 0

    book.save(update_fields=['average_rating', 'rating_number', 'updated_at'])

    return book
