from rest_framework.permissions import BasePermission

class IsTelegramBot(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        permission = user.user_type == 'BT' or user.user_type == 'SA'
        return user.is_authenticated and permission
