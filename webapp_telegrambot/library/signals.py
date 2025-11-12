from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Review
from .utils.book_rating_updater import update_book_rating

@receiver(post_save, sender=Review)
def review_saved(sender, instance, **kwargs):
    # Consider queuing this as a background job for production
    try:
        update_book_rating(instance.book.pk)
    except Exception:
        # avoid crashing signal chain
        import logging
        logging.exception("Failed to update book rating after review save")

@receiver(post_delete, sender=Review)
def review_deleted(sender, instance, **kwargs):
    try:
        update_book_rating(instance.book.pk)
    except Exception:
        import logging
        logging.exception("Failed to update book rating after review delete")
