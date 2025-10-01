from django.db.models import Avg, Count
from library.models import Book 

def update_book_rating(book_pk):
    """Recalculates and updates the average_rating and rating_number for a Book."""
    try:
        book = Book.objects.get(pk=book_pk)
    except Book.DoesNotExist:
        return
    
    stats = book.review_set.aggregate(
        avg_rating=Avg('rating'),
        count_rating=Count('review_id')
    )

    book.average_rating = stats['avg_rating']
    book.rating_number = stats['count_rating']

    book.save(update_fields=['average_rating', 'rating_number', 'updated_at'])

    return book