from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from library.views import BookViewSet, ReviewViewSet, CommentViewSet, UserBookViewSet, AuthorviewSet, CategoryViewSet
from user_app.views import UserViewSet
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

router = DefaultRouter()
router.register(r'books', BookViewSet, basename='book')
router.register(r'user-books', UserBookViewSet, basename='userbook')
router.register(r'authors', AuthorviewSet, basename='author')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'users', UserViewSet, basename='user')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'comments', CommentViewSet, basename='comment')

# Nested routers for reviews under books
books_router = routers.NestedDefaultRouter(router, r'books', lookup='book')
books_router.register(r'reviews', ReviewViewSet, basename='book-reviews')

# Nested routers for comments under reviews (nested under books)
reviews_router = routers.NestedDefaultRouter(books_router, r'reviews', lookup='review')
reviews_router.register(r'comments', CommentViewSet, basename='review-comments')

# Nested routers for comments under reviews (flat reviews route)
flat_reviews_router = routers.NestedDefaultRouter(router, r'reviews', lookup='review')
flat_reviews_router.register(r'comments', CommentViewSet, basename='flat-review-comments')

urlpatterns = [
    path("", include(router.urls)),
    path("", include(books_router.urls)),
    path("", include(reviews_router.urls)),
    path("", include(flat_reviews_router.urls)),
    path('users/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('users/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('users/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
]
