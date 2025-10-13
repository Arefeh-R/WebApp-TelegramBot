from rest_framework import viewsets, filters, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import F
from .models import Author, Book, Review, Comment, UserBook, ReviewLike, Category
from .permissions import IsOwnerOrReadOnly
from .serializers import (
    AuthorSerializer,
    BookSerializer,
    CategorySerializer,
    ReviewSerializer,
    CommentSerializer,
    UserBookSerializer,
)
from utils.pagination import CustomPageNumberPagination
from .services.openlibrary_sevice import search_book_in_openlibrary
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.exceptions import ValidationError
from django.db.models import Q

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all().prefetch_related("authors")
    serializer_class = BookSerializer
    pagination_class = CustomPageNumberPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]

    search_fields = [
        "title",              # Partial match on title
        "^authors__name",     # Starts with for author (better for names)
        "=isbn_13",          # Exact match for ISBN-13
        "=isbn_10",          # Exact match for ISBN-10
        "=parent_asin"       # Exact match for ASIN
    ]

    ordering_fields = ["publication_date", "average_rating"]
    
    def get_queryset(self):
        """Override to handle ISBN queries better"""
        queryset = super().get_queryset()
        search_param = self.request.query_params.get('search', None)
        
        if search_param and search_param.replace('-', '').replace(' ', '').isdigit():
            clean_isbn = search_param.replace('-', '').replace(' ', '')
            queryset = queryset.filter(
                Q(isbn_13__icontains=clean_isbn) | 
                Q(isbn_10__icontains=clean_isbn) |
                Q(parent_asin__icontains=clean_isbn)
            ).distinct()
        
        return queryset

    @action(detail=False, methods=["get"], url_path="top-rated")
    def top_rated(self, request):
        books = Book.objects.exclude(average_rating__isnull=True).order_by(
            "-average_rating"
        )[:10]
        serializer = self.get_serializer(books, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="search-external")
    def search_external(self, request):
        query = request.query_params.get("query")
        query_type = request.query_params.get("query_type")
        
        if not query or not query_type:
            return Response(
                {"detail": "Must provide both 'query' and 'query_type' (title, author, or isbn)."},
                status=status.HTTP_400_BAD_REQUEST,
            )
            
        supported_types = ["title", "author", "isbn"]
        if query_type not in supported_types:
            return Response(
                {"detail": f"Invalid query_type. Must be one of: {', '.join(supported_types)}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = search_book_in_openlibrary(query, query_type)

        if data and "error" not in data:
            return Response(data, status=status.HTTP_201_CREATED) 
        elif data and "error" in data:
            return Response(
                {"detail": data["error"]}, 
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        else:
            return Response(
                {"detail": "Book not found via Open Library API for the given query."},
                status=status.HTTP_404_NOT_FOUND,
            )
            
    # @action(detail=False, methods=["get"])
    # def popular(self, request):

    #     books = Book.objects.exclude(rating_number__isnull=True).order_by(F("rating_number").desc(nulls_last=True))[:10]

    #     # Alternative: Count reviews
    #     # books = Book.objects.annotate(review_count=Count("review")).order_by("-review_count")[:10]

    #     serializer = self.get_serializer(books, many=True)
    #     return Response(serializer.data)


class ReviewViewSet(viewsets.ModelViewSet):

    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    pagination_class = CustomPageNumberPagination

    def get_queryset(self):
        queryset = Review.objects.all().select_related("book", "user")
        book_pk = self.kwargs.get("book_pk")
        if book_pk:
            queryset = queryset.filter(book__parent_asin=book_pk)
        mine = self.request.query_params.get("mine")
        if mine and self.request.user.is_authenticated:
            queryset = queryset.filter(user=self.request.user)
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        book_pk = serializer.validated_data.get("book").pk
        if Review.objects.filter(book__pk=book_pk, user=user).exists():
            raise ValidationError("You have already reviewed this book.")
        serializer.save(user=user)

    @action(
        detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated]
    )
    def like(self, request, pk=None):
        review = get_object_or_404(self.get_queryset(), pk=pk)
        user = request.user

        like_instance = ReviewLike.objects.filter(review=review, user=user)

        if like_instance.exists():
            like_instance.delete()
            if review.helpful_vote > 0:
                review.helpful_vote = F("helpful_vote") - 1
                review.save(update_fields=["helpful_vote"])
                review.refresh_from_db()

            return Response(
                {
                    "detail": "Review unliked successfully.",
                    "helpful_vote": review.helpful_vote,
                },
                status=status.HTTP_200_OK,
            )

        else:
            ReviewLike.objects.create(review=review, user=user)
            review.helpful_vote = F("helpful_vote") + 1
            review.save(update_fields=["helpful_vote"])
            review.refresh_from_db()

            return Response(
                {
                    "detail": "Review liked successfully.",
                    "helpful_vote": review.helpful_vote,
                },
                status=status.HTTP_201_CREATED,
            )


class CommentViewSet(viewsets.ModelViewSet):

    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        queryset = Comment.objects.all().select_related("review", "user")
        review_pk = self.kwargs.get("review_pk")
        if not review_pk:
            review_pk = self.request.query_params.get("review")
        if review_pk:
            queryset = queryset.filter(review__pk=review_pk)
        return queryset.order_by("-created_at")  # order by date

    def perform_create(self, serializer):
        review_pk = self.kwargs.get("review_pk")
        if not review_pk:
            review_pk = self.request.data.get("review")
        if review_pk:
            review = Review.objects.get(pk=review_pk)
            serializer.save(user=self.request.user, review=review)
        else:
            serializer.save(user=self.request.user)


class UserBookViewSet(viewsets.ModelViewSet):
    """
    UserBook endpoints:
    - add book to wishlist/reading/completed
    - update progress
    - filter by status
    """

    serializer_class = UserBookSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        return UserBook.objects.filter(user=self.request.user).select_related("book")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["get"])
    def by_status(self, request):
        """
        Get books filtered by a specific status.
        Example URL: /books/by_status/?status=wishlist
        """
        status_param = request.query_params.get("status")
        valid_statuses = [choice[0] for choice in UserBook.STATUS_CHOICES]

        if status_param and status_param in valid_statuses:
            qs = self.get_queryset().filter(status=status_param)
            serializer = self.get_serializer(qs, many=True)
            return Response(serializer.data)

        return Response(
            {
                "error": f"Status parameter is required and must be one of: {', '.join(valid_statuses)}"
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


class AuthorviewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for listing and retrieving authors.
    """

    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    filter_backends = [filters.SearchFilter]

    search_fields = ["name", "about"]

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for listing and retrieving categories.
    """

    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter]

    search_fields = ["category_name"]