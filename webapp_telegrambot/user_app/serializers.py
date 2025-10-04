from rest_framework import serializers
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    """
    Standard serializer for reading and updating user profile data.
    Excludes sensitive fields like password.
    """
    class Meta:
        model = CustomUser
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 
            'display_name', 'bio', 'avatar_url', 
            'followers_count', 'books_rated_count', 
            'user_type', 'is_active', 'date_joined'
        )
        read_only_fields = ('user_type', 'is_active', 'date_joined', 'followers_count', 'books_rated_count')


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new user (registration).
    """
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password', 'password2', 'first_name', 'last_name', 'display_name')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, data):
        """Ensure password and password2 match."""
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password2": "Passwords must match."})
        return data

    def create(self, validated_data):
        """Create and return a new CustomUser instance."""
        validated_data.pop('password2')
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            display_name=validated_data.get('display_name', validated_data['username'])
        )
        # Default user_type is 'AU' (App User) as defined in the model
        return user
