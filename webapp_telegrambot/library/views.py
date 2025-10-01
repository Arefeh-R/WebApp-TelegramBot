from rest_framework import viewsets, generics, filters, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Avg, F, Count 
from .models import Book, Review, Comment, UserBook, ReviewLike 
from .permissions import IsOwnerOrReadOnly
from .serializers import (
    BookSerializer,
    ReviewSerializer,
    CommentSerializer,
    UserBookSerializer
)
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.exceptions import ValidationError 


class BookViewSet(viewsets.ModelViewSet):

    queryset = Book.objects.all().prefetch_related("authors") 
    serializer_class = BookSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    
    search_fields = ["title", "authors__name", "=isbn_13", "isbn_10","=parent_asin"] 
    
    ordering_fields = ["publication_date", "average_rating"] 

    @action(detail=False, methods=["get"])
    def top_rated(self, request):

        books = Book.objects.exclude(average_rating__isnull=True).order_by("-average_rating")[:10]        
        serializer = self.get_serializer(books, many=True)
        return Response(serializer.data)

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
        book_pk = serializer.validated_data.get('book').pk 
        if Review.objects.filter(book__pk=book_pk, user=user).exists():
             raise ValidationError("You have already reviewed this book.")
        serializer.save(user=user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        review = get_object_or_404(self.get_queryset(), pk=pk)
        user = request.user
        
        like_instance = ReviewLike.objects.filter(review=review, user=user)

        if like_instance.exists():            
            like_instance.delete() 
            if review.helpful_vote > 0:
                review.helpful_vote = F('helpful_vote') - 1
                review.save(update_fields=['helpful_vote'])
                review.refresh_from_db()
                
            return Response(
                {"detail": "Review unliked successfully.", "helpful_vote": review.helpful_vote}, 
                status=status.HTTP_200_OK 
            )
            
        else:
            ReviewLike.objects.create(review=review, user=user)
            review.helpful_vote = F('helpful_vote') + 1
            review.save(update_fields=['helpful_vote'])
            review.refresh_from_db() 
            
            return Response(
                {"detail": "Review liked successfully.", "helpful_vote": review.helpful_vote}, 
                status=status.HTTP_201_CREATED 
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
            
        return queryset.order_by('-created_at') # order by date
 
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
            {"error": f"Status parameter is required and must be one of: {', '.join(valid_statuses)}"}, 
            status=status.HTTP_400_BAD_REQUEST
        )