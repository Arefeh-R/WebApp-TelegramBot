
from django.db import models
from django.conf import settings 

class ForumTopic(models.Model):
    topic_id = models.BigIntegerField(
        unique=True,
        verbose_name="Topic ID (message_thread_id)",
        help_text="The unique ID of the topic/thread in Telegram. Used for sending messages to the topic."
    )
    chat_id = models.BigIntegerField(
        verbose_name="Supergroup Chat ID",
        help_text="The ID of the Telegram Supergroup (Forum) that contains this topic."
    )
    name = models.CharField(max_length=128, verbose_name="Topic Name")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='forum_topics')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Forum Topic"
        verbose_name_plural = "Forum Topics"
        unique_together = ('topic_id', 'chat_id') 

    def __str__(self):
        return f"Topic: '{self.name}' in Chat: {self.chat_id}"


    @classmethod
    def get_active_topic_count(cls, chat_id):
        return cls.objects.filter(chat_id=chat_id, is_active=True).count()