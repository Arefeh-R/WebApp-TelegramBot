from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Author, Book, Category, Review, Comment, UserBook

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['category_id', 'category_name']

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ['author_id', 'name', 'about', 'created_at', 'updated_at']
        
class BookSerializer(serializers.ModelSerializer):
    authors = AuthorSerializer(many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    class Meta:
        model = Book
        fields = [
            "parent_asin",
            "average_rating",
            "rating_number",
            "title",
            "authors",
            "isbn_10",
            "isbn_13",
            "details_jsonb",
            "publication_date",
            "categories",
            "features",
            "created_at",
            "updated_at",
        ]


# Assuming your user model has a 'username' or 'get_full_name' method
class ReviewSerializer(serializers.ModelSerializer):

    book = BookSerializer(read_only=True)
    reviewer_display = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = (
            'review_id', 'book', 'rating', 'title', 'review_text',
            'helpful_vote', 'verified_purchase', 'review_date',
            'reviewer_display' # Include the new display field
            # Do NOT include 'user' or 'amazon_user_id' in writable fields
            # as they are set in the view
        )
        read_only_fields = ('helpful_vote',)

    def get_reviewer_display(self, obj):
        """Returns the application user's name or the Amazon user ID."""
        if obj.user:
            # Review from app user: return username or display name
            return obj.user.get_username() # or obj.user.email, etc.
        elif obj.amazon_user_id:
            # Review from bulk imported data
            return f"Amazon User: {obj.amazon_user_id}"
        return "Anonymous Reviewer"


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = [
            "id",
            "user",
            "review",
            "content",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["user", "created_at", "updated_at"]


class UserBookSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    book = BookSerializer(read_only=True)

    class Meta:
        model = UserBook
        fields = [
            "id",
            "user",
            "book",
            "status",
            "progress",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["user", "created_at", "updated_at"]

