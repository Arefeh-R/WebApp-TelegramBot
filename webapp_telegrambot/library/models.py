from django.db import models
from django.conf import settings

# using the default user model
User = settings.AUTH_USER_MODEL


class Author(models.Model):
    name = models.CharField(max_length=255)
    bio = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class Book(models.Model):
    openlibrary_id = models.CharField(
        max_length=100, blank=True, null=True, unique=True
    )  # if from Open Library
    title = models.CharField(max_length=500)
    # subtitle = models.CharField(max_length=500, blank=True)
    authors = models.ManyToManyField(Author, related_name="books")
    description = models.TextField(blank=True)
    published_year = models.PositiveIntegerField(blank=True, null=True)
    genres = models.JSONField(
        default=list, blank=True
    )  # later can move to separate model
    isbn = models.CharField(max_length=20, blank=True, null=True)
    cover_url = models.URLField(blank=True, null=True)
    views = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def avg_rating(self):
        return self.reviews.aggregate(models.Avg("rating"))["rating__avg"] or 0

    def __str__(self):
        return self.title


class Review(models.Model):
    book = models.ForeignKey(Book, related_name="reviews", on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name="reviews", on_delete=models.CASCADE)
    content = models.TextField(
        null=True, blank=True
    )  # a review can be just a rating without text
    rating = models.PositiveSmallIntegerField(default=0)  # 1–5 stars
    likes = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("book", "user")  # one review per user per book

    def __str__(self):
        return f"{self.user} - {self.book} ({self.rating})"


class Comment(models.Model):
    review = models.ForeignKey(
        Review, related_name="comments", on_delete=models.CASCADE
    )
    user = models.ForeignKey(User, related_name="comments", on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Comment by {self.user} on {self.review}"

class UserBook(models.Model):
    STATUS_CHOICES = [
        ("reading", "Reading"),
        ("completed", "Completed"),
        ("wishlist", "Wishlist"),
        ("dropped", "Dropped"),
    ]

    user = models.ForeignKey(User, related_name="user_books", on_delete=models.CASCADE)
    book = models.ForeignKey(Book, related_name="user_books", on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="wishlist")
    #progress = models.PositiveIntegerField(default=0)  # % completed or page count
    created_at = models.DateField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "book")  # one record per user per book

    def __str__(self):
        return f"{self.user} - {self.book} ({self.status})"


# class BookSearchLog(models.Model):
#     """Optional: track user searches (helps with trending/popular)"""

#     user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
#     query = models.CharField(max_length=255)
#     created_at = models.DateTimeField(auto_now_add=True)


# relations
# Book ↔ Author → Many-to-Many
# Book ↔ Review → One-to-Many
# Review ↔ Comment → One-to-Many
# Book ↔ User (via Review) → users review & rate books
# BookSearchLog → optional, helps for analytics & popularity
