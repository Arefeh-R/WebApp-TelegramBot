from rest_framework import serializers
from .models import Group, ForumTopic, TelegramProfile
from library.models import Review

class ForumTopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForumTopic
        fields = ["id", "name", "group", "topic_id", "is_active", "description"]

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ["id", "name", "member_count", "telegram_invite_link","description", "requested_by", "is_approved"]

class TelegramProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TelegramProfile
        fields = ["id","telegram_id", "username", "user", "auth_token"]
        extra_kwargs = {
            'user': {'read_only': True},
            'id': {'read_only': True}
            }
