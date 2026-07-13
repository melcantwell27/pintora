from rest_framework import serializers

from .models import User


class UserPublicSerializer(serializers.ModelSerializer):
    """Read-only public profile shown on recipe cards and author pages."""

    class Meta:
        model = User
        fields = ["id", "username", "bio", "avatar"]
        read_only_fields = fields


class UserMeSerializer(serializers.ModelSerializer):
    """Current authenticated user — used by the FE for global session context."""

    class Meta:
        model = User
        fields = ["id", "username", "email", "bio", "avatar"]
        read_only_fields = ["id", "username", "email"]
