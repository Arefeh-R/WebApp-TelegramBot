from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Review
from .utils.book_rating_updater import update_book_rating 

@receiver(post_save, sender=Review)
def review_post_save(sender, instance, created, **kwargs):
    """Updates Book rating after a Review is created or updated."""
    update_book_rating(instance.book.pk)

@receiver(post_delete, sender=Review)
def review_post_delete(sender, instance, **kwargs):
    """Updates Book rating after a Review is deleted."""
    update_book_rating(instance.book.pk)