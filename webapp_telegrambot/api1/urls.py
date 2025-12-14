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
from telegram_bot.views import GroupCategoryViewSet, GroupViewSet, TelegramProfileViewSet, ForumTopicViewSet

router = DefaultRouter()

#library routers

router.register(r'books', BookViewSet, basename='book')
router.register(r'user-books', UserBookViewSet, basename='userbook')
router.register(r'authors', AuthorviewSet, basename='author')
router.register(r'categories', CategoryViewSet, basename='category')

router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'comments', CommentViewSet, basename='comment')

books_router = routers.NestedDefaultRouter(router, r'books', lookup='book')
books_router.register(r'reviews', ReviewViewSet, basename='book-reviews')

reviews_router = routers.NestedDefaultRouter(books_router, r'reviews', lookup='review')
reviews_router.register(r'comments', CommentViewSet, basename='review-comments')

flat_reviews_router = routers.NestedDefaultRouter(router, r'reviews', lookup='review')
flat_reviews_router.register(r'comments', CommentViewSet, basename='flat-review-comments')


#user routes
router.register(r'users', UserViewSet, basename='user')


#telegram routes
router.register(r'groups', GroupViewSet, basename='group')
router.register(r'telegram-profiles', TelegramProfileViewSet, basename='telegram-profile')
router.register(r'topics', ForumTopicViewSet, basename='forum-topic')

router.register( r'group-categories', GroupCategoryViewSet, basename='group-category')


urlpatterns = [
    path("", include(router.urls)),
    path("", include(books_router.urls)),
    path("", include(reviews_router.urls)),
    path("", include(flat_reviews_router.urls)),
    path('users/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('users/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('users/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
]
