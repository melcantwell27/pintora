from drf_spectacular.utils import extend_schema
from rest_framework import mixins, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from .serializers import UserMeSerializer, UserPublicSerializer


class UserViewSet(mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """Public user profiles."""

    queryset = User.objects.all()
    serializer_class = UserPublicSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "username"
    lookup_url_kwarg = "username"


class MeView(APIView):
    """The currently authenticated user (single object, not a list)."""

    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses=UserMeSerializer, operation_id="me_retrieve")
    def get(self, request):
        serializer = UserMeSerializer(request.user)
        return Response(serializer.data)


class MeProfileView(APIView):
    """Partial profile updates for the currently authenticated user."""

    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=UserMeSerializer,
        responses=UserMeSerializer,
        operation_id="me_profile_update",
    )
    def patch(self, request):
        serializer = UserMeSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
