# library/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ForumTopic
from telegram_bot.services.utils import create_telegram_topic

@receiver(post_save, sender=ForumTopic)
def create_forum_topic_on_approval(sender, instance, created, **kwargs):
    if not created and instance.is_approved and not instance.telegram_topic_id:
        topic_id = create_telegram_topic(instance)
        if topic_id:
            instance.telegram_topic_id = topic_id
            instance.save(update_fields=["telegram_topic_id"])
