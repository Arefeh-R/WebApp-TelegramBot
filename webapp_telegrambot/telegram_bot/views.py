from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Group, ForumTopic, GroupMembership, TelegramProfile, ForumTopic
from .serializers import GroupSerializer, ForumTopicSerializer, TelegramProfileSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .permissions import IsTelegramBot

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    
    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user

        if not user.is_authenticated or not user.is_staff:
            qs = qs.filter(is_approved=True)

        return qs
    
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        group = self.get_object()
        user = request.user
        membership, created = GroupMembership.objects.get_or_create(user=user, group=group)
        if created:
            return Response({"detail": "Joined group successfully."})
        return Response({"detail": "Already a member."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def topics(self, request, pk=None):
        group = self.get_object()
        topics = ForumTopic.objects.filter(group=group, is_active=True)
        serializer = ForumTopicSerializer(topics, many=True)
        return Response(serializer.data)
    
    
    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def request_group(self, request):
        name = request.data.get("name")
        description = request.data.get("description")

        if not name:
            return Response({"detail": "Group name is required"}, status=status.HTTP_400_BAD_REQUEST)

        group = Group.objects.create(
            id = 0,
            name=name,
            description=description or "",
            requested_by=request.user,
            is_approved=False,
        )

        return Response(
            {"detail": "Your group request has been submitted and awaits admin approval."},
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["patch"], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        group = self.get_object()
        link = request.data.get("telegram_invite_link")

        if not link:
            return Response({"detail": "Invite link required"}, status=status.HTTP_400_BAD_REQUEST)

        group.telegram_invite_link = link
        group.is_approved = True
        group.save()

        return Response({"detail": "Group approved successfully!"}, status=status.HTTP_200_OK)



class TelegramProfileViewSet(viewsets.ModelViewSet):
    queryset = TelegramProfile.objects.all()
    serializer_class = TelegramProfileSerializer

    
    def get_queryset(self):
        qs = super().get_queryset()
        telegram_id = self.request.query_params.get("telegram_id")
        if telegram_id:
            qs = qs.filter(telegram_id=telegram_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
    @action(detail=False, methods=["post"], permission_classes=[IsTelegramBot])
    def token_by_telegram(self, request):
        telegram_id = request.data.get("telegram_id")
        if not telegram_id:
            return Response(
                {"detail": "telegram_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile = TelegramProfile.objects.filter(
            telegram_id=telegram_id
        ).select_related("user").first()

        if not profile or not profile.user:
            return Response(
                {"detail": "Telegram user not linked"},
                status=status.HTTP_404_NOT_FOUND,
            )

        refresh = RefreshToken.for_user(profile.user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_200_OK,
        )
        
        
class ForumTopicViewSet(viewsets.ModelViewSet):
    queryset = ForumTopic.objects.all()
    serializer_class = ForumTopicSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        group_id = self.request.query_params.get("group_id")
        if group_id:
            qs = qs.filter(group_id=group_id)
        return qs

    def perform_create(self, serializer):
        serializer.save()