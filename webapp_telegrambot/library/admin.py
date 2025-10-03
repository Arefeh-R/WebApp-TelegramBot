from django.contrib import admin
from library.models import Author, Book, Review, Comment, Category, UserBook, Image, BookAuthor, BookCategory, ReviewLike

# Register your models here.
admin.site.register(Author)
admin.site.register(Book)
admin.site.register(Review)
admin.site.register(Comment)
admin.site.register(Category)
admin.site.register(UserBook)
admin.site.register(Image)
admin.site.register(BookAuthor)
admin.site.register(BookCategory)
admin.site.register(ReviewLike)
