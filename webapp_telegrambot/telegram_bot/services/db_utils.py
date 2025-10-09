# Database utilities
from django.contrib.auth import get_user_model

User = get_user_model()

def get_user_data(user_id):
    try:
        user = User.objects.get(id=user_id)
        return user
    except User.DoesNotExist:
        return None
