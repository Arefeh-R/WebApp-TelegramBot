from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Book, Review, Comment, UserBook

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


class BookSerializer(serializers.ModelSerializer):
    authors = serializers.ListField(child=serializers.CharField(), required=False)

    class Meta:
        model = Book
        fields = [
            "id",
            "title",
            "authors",
            "isbn",
            "year",
            "genre",
            "cover",
            "description",
            "created_at",
            "updated_at",
        ]


class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "user",
            "book",
            "rating",
            "content",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["user", "created_at", "updated_at"]


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
