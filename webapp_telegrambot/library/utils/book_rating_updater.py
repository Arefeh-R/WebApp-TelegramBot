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

    # Bayesian weighted rating
    C = 3.5  # global average
    m = 10   # minimum votes for reliability
    if count and avg is not None:
        # compute as float
        weighted = (count / (count + m)) * float(avg) + (m / (count + m)) * float(C)
        book.weighted_rating = round(weighted, 2)
    else:
        # No reviews -> you may want global average or None; using global average keeps ranking stable
        book.weighted_rating = float(C)

    book.save(update_fields=['average_rating', 'rating_number', 'weighted_rating', 'updated_at'])

    return book
