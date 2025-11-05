
from django.conf import settings 
from django.db import models

User = settings.AUTH_USER_MODEL
class TelegramProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    telegram_id = models.BigIntegerField(unique=True)
    username = models.CharField(max_length=255, blank=True, null=True)
    auth_token = models.CharField(max_length=255, blank=True, null=True) 
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        app_label = 'telegram_bot'
    
class Group(models.Model):
    id = models.BigIntegerField(primary_key=True,verbose_name='Telegram Group ID')
    name = models.CharField(max_length=128, unique=True)
    description = models.TextField(blank=True)
    member_count = models.PositiveIntegerField(default=0)
    telegram_invite_link = models.URLField(blank=True, null=True)
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='requested_groups'
    )
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        through='GroupMembership', 
        related_name='joined_groups'
    )
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'telegram_bot'
    
    def __str__(self):
        return self.name


class GroupMembership(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'group')
        app_label = 'telegram_bot'


class ForumTopic(models.Model):
    """
    Represents a discussion thread (subgroup) inside a Telegram forum (supergroup)
    and linked to a Group in Django.
    """
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='topics')
    topic_id = models.BigIntegerField(unique=True, verbose_name="Telegram Topic ID")
    name = models.CharField(max_length=128)
    description = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='forum_topics'
    )
    is_active = models.BooleanField(default=True)
    is_full = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('group', 'name')

    def __str__(self):
        return f"{self.name} ({self.group.name})"
    
