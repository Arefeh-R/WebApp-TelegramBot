from django.urls import path, include
from rest_framework.routers import DefaultRouter
from library.views import BookViewSet, ReviewViewSet, CommentViewSet, UserBookViewSet, AuthorviewSet, CategoryViewSet

router = DefaultRouter()
router.register(r'books', BookViewSet, basename='book')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'user-books', UserBookViewSet, basename='userbook')
router.register(r'authors', AuthorviewSet, basename='author')
router.register(r'categories', CategoryViewSet, basename='category')

urlpatterns = [
    path("", include(router.urls)),
]
