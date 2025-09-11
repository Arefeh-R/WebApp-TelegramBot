from django.db import models
from django.conf import settings

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
    subtitle = models.CharField(max_length=500, blank=True)
    authors = models.ManyToManyField(Author, related_name="books")
    description = models.TextField(blank=True)
    published_year = models.PositiveIntegerField(blank=True, null=True)
    genres = models.JSONField(default=list, blank=True)  # later can move to separate model
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
    content = models.TextField()
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

    def __str__(self):
        return f"Comment by {self.user} on {self.review}"


# class BookSearchLog(models.Model):
#     """Optional: track user searches (helps with trending/popular)"""

#     user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
#     query = models.CharField(max_length=255)
#     created_at = models.DateTimeField(auto_now_add=True)


# Book ↔ Author → Many-to-Many
# Book ↔ Review → One-to-Many
# Review ↔ Comment → One-to-Many
# Book ↔ User (via Review) → users review & rate books
# BookSearchLog → optional, helps for analytics & popularity
