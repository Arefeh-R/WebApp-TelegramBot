from django.contrib import admin
from .models import ForumTopic, Group, GroupMembership, TelegramProfile

admin.site.register(ForumTopic)
admin.site.register(Group)
admin.site.register(GroupMembership)
admin.site.register(TelegramProfile)
