from rest_framework import viewsets, generics, filters, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Avg
from .models import Book, Review, Comment, UserBook
from .serializers import (
    BookSerializer,
    ReviewSerializer,
    CommentSerializer,
    UserBookSerializer,
)


# ----------------------------
# Book Views
# ----------------------------
class BookViewSet(viewsets.ModelViewSet):
    """
    Book endpoints:
    - list, retrieve, create, update, delete
    - search (by title, author, ISBN)
    - extra action: top-rated, popular 
    """

    queryset = Book.objects.all().prefetch_related("authors")
    serializer_class = BookSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "authors__name", "isbn"]
    ordering_fields = ["published_year", "views"]

    @action(detail=False, methods=["get"])
    def top_rated(self, request):
        """Get top rated books by avg review rating"""
        books = Book.objects.annotate(avg_rating=Avg("reviews__rating")).order_by(
            "-avg_rating"
        )[:10]
        serializer = self.get_serializer(books, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def popular(self, request):
        """Get most viewed books"""
        books = Book.objects.order_by("-views")[:10]
        serializer = self.get_serializer(books, many=True)
        return Response(serializer.data)


# ----------------------------
# Review Views
# ----------------------------
class ReviewViewSet(viewsets.ModelViewSet):
    """
    Review endpoints:
    - list (all or by book)
    - create (user can review book once)
    - update, delete
    """

    queryset = Review.objects.all().select_related("book", "user")
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ----------------------------
# Comment Views
# ----------------------------
class CommentViewSet(viewsets.ModelViewSet):
    """
    Comment endpoints:
    - list (all or by review)
    - create, update, delete
    """

    queryset = Comment.objects.all().select_related("review", "user")
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ----------------------------
# UserBook Views
# ----------------------------
class UserBookViewSet(viewsets.ModelViewSet):
    """
    UserBook endpoints:
    - add book to wishlist/reading/completed
    - update progress
    - filter by status
    """

    serializer_class = UserBookSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserBook.objects.filter(user=self.request.user).select_related("book")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """
        Get books filtered by a specific status.
        Example URL: /books/by_status/?status=wishlist
        """
        status = request.query_params.get('status')
        if status:
            qs = self.get_queryset().filter(status=status)
            serializer = self.get_serializer(qs, many=True)
            return Response(serializer.data)
        return Response({"error": "Status parameter is required"}, status=400)
    
    
    # @action(detail=False, methods=["get"])
    # def wishlist(self, request):
    #     qs = self.get_queryset().filter(status="wishlist")
    #     serializer = self.get_serializer(qs, many=True)
    #     return Response(serializer.data)

    # @action(detail=False, methods=["get"])
    # def reading(self, request):
    #     qs = self.get_queryset().filter(status="reading")
    #     serializer = self.get_serializer(qs, many=True)
    #     return Response(serializer.data)

    # @action(detail=False, methods=["get"])
    # def completed(self, request):
    #     qs = self.get_queryset().filter(status="completed")
    #     serializer = self.get_serializer(qs, many=True)
    #     return Response(serializer.data)
