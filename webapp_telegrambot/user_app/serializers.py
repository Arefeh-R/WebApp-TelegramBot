from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

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

    def validate_password(self, value):
        try:
            validate_password(value) 
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
            
        return value

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

class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change requests."""
    
    # Input fields
    old_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    new_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    new_password_confirm = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})

    def validate_new_password(self, value):
        """Apply strong password validation to the new password."""
        try:
            # Use Django's built-in password validators
            validate_password(value) 
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
            
        return value

    def validate(self, data):
        """
        Validate:
        1. Does the old_password match the user's current password?
        2. Do the new_password and new_password_confirm match?
        """
        user = self.context['request'].user
        old_password = data.get('old_password')
        new_password = data.get('new_password')
        new_password_confirm = data.get('new_password_confirm')

        # 1. Check if the old password is correct
        if not user.check_password(old_password):
            raise serializers.ValidationError({"old_password": "Wrong password. Please enter your current password correctly."})

        # 2. Check if the new passwords match
        if new_password != new_password_confirm:
            raise serializers.ValidationError({"new_password_confirm": "The two password fields didn't match."})

        # 3. Check if new password is the same as the old password (Optional, but good practice)
        if user.check_password(new_password):
            raise serializers.ValidationError({"new_password": "The new password cannot be the same as the old password."})

        return data