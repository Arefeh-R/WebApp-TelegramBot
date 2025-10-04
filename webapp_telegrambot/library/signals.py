from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from .models import Review
from .utils.book_rating_updater import update_book_rating

@receiver(pre_save, sender=Review)
def review_pre_save(sender, instance, **kwargs):
    """Store the old rating before saving."""
    if instance.pk:
        try:
            old_instance = Review.objects.get(pk=instance.pk)
            instance._old_rating = old_instance.rating
        except Review.DoesNotExist:
            instance._old_rating = None
    else:
        instance._old_rating = None

@receiver(post_save, sender=Review)
def review_post_save(sender, instance, created, **kwargs):
    """Updates Book rating after a Review is created or updated (only if rating changed)."""
    if created or getattr(instance, '_old_rating', None) != instance.rating:
        update_book_rating(instance.book.pk)

@receiver(post_delete, sender=Review)
def review_post_delete(sender, instance, **kwargs):
    """Updates Book rating after a Review is deleted."""
    update_book_rating(instance.book.pk)
