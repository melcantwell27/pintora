from drf_spectacular.utils import extend_schema
from rest_framework import mixins, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import User
from .serializers import UserMeSerializer, UserPublicSerializer


class UserViewSet(mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """Public user profiles."""

    queryset = User.objects.all()
    serializer_class = UserPublicSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "username"
    lookup_url_kwarg = "username"


class MeViewSet(viewsets.ViewSet):
    """Endpoints for the currently authenticated user."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserMeSerializer

    @extend_schema(responses=UserMeSerializer)
    def list(self, request):
        serializer = UserMeSerializer(request.user)
        return Response(serializer.data)

    @extend_schema(request=UserMeSerializer, responses=UserMeSerializer)
    @action(detail=False, methods=["patch"], url_path="profile")
    def update_profile(self, request):
        serializer = UserMeSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
