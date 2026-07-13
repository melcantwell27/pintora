from rest_framework import permissions


class IsCreatorOrReadOnly(permissions.BasePermission):
    """Published recipes are public; only the creator can edit."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return obj.is_published or obj.created_by == request.user
        return obj.created_by == request.user
