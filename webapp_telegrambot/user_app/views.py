from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import CustomUser
from .serializers import PasswordChangeSerializer, UserSerializer, UserRegistrationSerializer

class UserViewSet(viewsets.GenericViewSet):
    """
    Handles user profile management (retrieve/update) and registration.
    Base URL: /api/users/
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

    # Registration endpoint
    @action(detail=False, methods=['post'], permission_classes=[AllowAny], url_path='register')
    def register(self, request):
        """Public endpoint to create a new user account."""
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid(raise_exception=True):
            user = serializer.save()
            
            # Use the standard serializer for the response format
            response_serializer = self.get_serializer(user)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        # This line is technically unreachable due to raise_exception=True, but included for completeness
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Profile retrieval/update endpoints
    @action(detail=False, methods=['get', 'put', 'patch'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """
        Allows authenticated users to retrieve and update their own profile.
        GET /api/users/me/
        PUT/PATCH /api/users/me/
        """
        user = request.user
        
        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(serializer.data)

        # Handle PUT/PATCH requests for update
        # Use partial=True for PATCH requests
        serializer = self.get_serializer(user, data=request.data, partial=request.method == 'PATCH')
        
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated], url_path='set_password')
    def set_password(self, request):
        """
        Allows authenticated users to change their password.
        POST /api/users/set_password/
        """
        # Pass the request context so the serializer can access request.user
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})

        if serializer.is_valid(raise_exception=True):
            user = request.user
            
            # The serializer has already validated the new_password for strength and matching
            new_password = serializer.validated_data['new_password']
            
            # The method that securely hashes and saves the new password
            user.set_password(new_password)
            user.save()
            
            # Optionally, log the user out/revoke tokens for security
            # from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
            # OutstandingToken.objects.filter(user=user).delete() 

            # Respond with a success message
            return Response({'detail': 'Password updated successfully.'}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)