from django.conf import settings
from django.db import models
from django.core.exceptions import ValidationError
from django.db.models import Avg, Count

User = settings.AUTH_USER_MODEL


class Author(models.Model):
    author_id = models.AutoField(primary_key=True)
    name = models.CharField(unique=True, max_length=255)
    avatar_url = models.TextField(blank=True, null=True)
    about = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = "authors"


class Category(models.Model):
    category_id = models.AutoField(primary_key=True)
    category_name = models.CharField(unique=True, max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = "categories"


class Review(models.Model):
    review_id = models.AutoField(primary_key=True)
    book = models.ForeignKey("Book", models.DO_NOTHING, db_column="book_id", related_name='reviews')
    amazon_user_id = models.CharField(max_length=255, db_column="amazon_user_id", blank=True, null=True)
    user = models.ForeignKey(User,on_delete=models.SET_NULL, related_name='reviews', blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1)
    title = models.TextField(blank=True, null=True)
    review_text = models.TextField(db_column="review_text", blank=True, null=True)
    helpful_vote = models.IntegerField(default=0)# reviewlikes count
    verified_purchase = models.BooleanField(default=False)
    review_date = models.DateTimeField(blank=True, null=True)
    images_jsonb = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = "reviews"
        
    def clean(self):
        if not self.amazon_user_id and not self.user:
            raise ValidationError("A Review must be associated with either an Amazon User ID or an application User.")



class Book(models.Model):
    parent_asin = models.CharField(db_column="parent_asin", primary_key=True, max_length=255)
    main_category = models.CharField(max_length=255, blank=True, null=True)
    title = models.TextField()
    subtitle = models.TextField(blank=True, null=True)
    authors = models.ManyToManyField("Author", through="BookAuthor")
    categories = models.ManyToManyField("Category", through="BookCategory")
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)
    rating_number = models.IntegerField(blank=True, null=True)
    weighted_rating = models.FloatField(blank=True, null=True, db_index=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    features = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    details_jsonb = models.JSONField(blank=True, null=True)
    videos_jsonb = models.JSONField(blank=True, null=True)
    tsv_content = models.TextField(blank=True, null=True)  # This field type is a guess.
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    isbn_13 = models.CharField(max_length=13, blank=True, null=True, verbose_name="ISBN 13" )
    isbn_10 = models.CharField(max_length=13, blank=True, null=True, verbose_name="ISBN 10" )
    publication_date = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "books"



class BookAuthor(models.Model):
    book = models.ForeignKey("Book", models.DO_NOTHING, db_column="book_id")
    author = models.ForeignKey("Author", models.DO_NOTHING, db_column="author_id")

    class Meta:
        managed = False
        db_table = "book_authors"
        unique_together = (("book", "author"),)


class BookCategory(models.Model):
    book = models.ForeignKey("Book", models.DO_NOTHING, db_column="book_id")
    category = models.ForeignKey("Category", models.DO_NOTHING, db_column="category_id")

    class Meta:
        managed = False
        db_table = "book_categories"
        unique_together = (("book", "category"),)


class Image(models.Model):
    image_id = models.AutoField(primary_key=True)
    book = models.ForeignKey("Book", models.DO_NOTHING, db_column="book_id", related_name="images")
    large_url = models.TextField()
    variant = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = "images"


class Comment(models.Model):
    review = models.ForeignKey("Review", related_name="comments", on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="comments", on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        pass

    def __str__(self):
        return f"Comment by {self.user.get_username()} on {self.review}"


class UserBook(models.Model):
    STATUS_CHOICES = [
        ("reading", "Reading"),
        ("completed", "Completed"),
        ("wishlist", "Wishlist"),
        ("dropped", "Dropped"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="user_books", on_delete=models.CASCADE)
    book = models.ForeignKey("Book", related_name="user_books", on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="wishlist")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "book")  # one record per user per book
        verbose_name = "User Book Status"

    def __str__(self):
        return f"{self.user.get_username()} - {self.book.title} ({self.status})"


class ReviewLike(models.Model):

    review = models.ForeignKey('Review', related_name='likes', on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='review_likes', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'review') #each user can like a review only once
        verbose_name = "Review Like"
        verbose_name_plural = "Review Likes"

    def __str__(self):
        return f"{self.user.get_username()} likes Review {self.review.review_id}"
