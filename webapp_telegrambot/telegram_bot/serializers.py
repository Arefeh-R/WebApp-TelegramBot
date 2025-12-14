from rest_framework import serializers
from .models import Group, ForumTopic, GroupCategory, TelegramProfile
from library.models import Review

class ForumTopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForumTopic
        fields = ["id", "name", "group", "topic_id", "is_active", "description"]

class GroupCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupCategory
        fields = ['id', 'name', 'description']

class GroupSerializer(serializers.ModelSerializer):
    category = GroupCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=GroupCategory.objects.all(),
        source='category',
        write_only=True,
        required=False
    )

    class Meta:
        model = Group
        fields = [
            'id',
            'name',
            'description',
            'member_count',
            'telegram_invite_link',
            'category',
            'category_id'
        ]
        
    def create(self, validated_data):
        if 'category' not in validated_data:
            validated_data['category'] = GroupCategory.objects.get(
                name__iexact='general'
            )
        return super().create(validated_data)

class GroupAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = [
            'id',
            'name',
            'description',
            'telegram_group_id',
            'member_count',
            'is_approved',
            'category'
        ]

    def validate(self, data):
        if data.get('is_approved') and not data.get('telegram_group_id'):
            raise serializers.ValidationError(
                "telegram_group_id is required when approving a group"
            )
        return data


class TelegramProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TelegramProfile
        fields = ["id","telegram_id", "username", "user", "auth_token"]
        extra_kwargs = {
            'user': {'read_only': True},
            'id': {'read_only': True}
            }

