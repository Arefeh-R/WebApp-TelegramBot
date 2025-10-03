from rest_framework import viewsets, generics, filters, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Avg, F, Count
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
from .services.openlibrary_sevice import search_book_in_openlibrary
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.exceptions import ValidationError


class BookViewSet(viewsets.ModelViewSet):

    queryset = Book.objects.all().prefetch_related("authors")
    serializer_class = BookSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]

    search_fields = ["title", "authors__name", "=isbn_13", "isbn_10", "=parent_asin"]

    ordering_fields = ["publication_date", "average_rating"]

    @action(detail=False, methods=["get"])
    def top_rated(self, request):

        books = Book.objects.exclude(average_rating__isnull=True).order_by(
            "-average_rating"
        )[:10]
        serializer = self.get_serializer(books, many=True)
        return Response(serializer.data)

    # Custom action for searching Open Library as a fallback
    @action(detail=False, methods=["get"], url_path="search-external")
    def search_external(self, request):
        # 1. READ THE NEW PARAMETERS FROM THE REQUEST
        query = request.query_params.get("query")
        query_type = request.query_params.get("query_type")
        
        # 2. VALIDATE REQUIRED PARAMETERS
        if not query or not query_type:
            return Response(
                {"detail": "Must provide both 'query' and 'query_type' (title, author, or isbn)."},
                status=status.HTTP_400_BAD_REQUEST,
            )
            
        # Ensure query_type is one of the supported values
        supported_types = ["title", "author", "isbn"]
        if query_type not in supported_types:
            return Response(
                {"detail": f"Invalid query_type. Must be one of: {', '.join(supported_types)}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 3. FALLBACK TO OPEN LIBRARY API
        # The service function 'search_book_in_openlibrary' will handle the API routing
        data = search_book_in_openlibrary(query, query_type)

        # 4. HANDLE EXTERNAL RESULT
        if data and "error" not in data:
            # New book successfully saved and returned by the service
            # Use 201 for a newly created resource
            return Response(data, status=status.HTTP_201_CREATED) 
            
        elif data and "error" in data:
            # External API failed (e.g., timeout, 500 error from OL)
            return Response(
                {"detail": data["error"]}, 
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        else:
            # No results found (no book found for the given query/isbn)
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

    queryset = Review.objects.all().select_related("book", "user")
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def perform_create(self, serializer):
        user = self.request.user
        book_pk = serializer.validated_data.get("book").pk
        if Review.objects.filter(book__pk=book_pk, user=user).exists():
            raise ValidationError("You have already reviewed this book.")
        review = serializer.save(user=user)
        review.book.recalculate_ratings()
        
    def perform_update(self, serializer):
        review = serializer.save()
        review.book.recalculate_ratings()

    def perform_destroy(self, instance):
        book_to_update = instance.book 
        instance.delete()
        book_to_update.recalculate_ratings()

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

    queryset = Comment.objects.all().select_related("review", "user")
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        review_pk = self.kwargs.get("review_pk")
        if review_pk:
            queryset = queryset.filter(review__pk=review_pk)

        return queryset.order_by("-created_at")  # order by date

    def perform_create(self, serializer):
        review_pk = self.kwargs.get("review_pk")
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