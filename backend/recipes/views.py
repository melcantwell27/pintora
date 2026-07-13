from rest_framework import filters, permissions, viewsets

from .models import Recipe
from .permissions import IsCreatorOrReadOnly
from .serializers import (
    RecipeDetailSerializer,
    RecipeListSerializer,
    RecipeWriteSerializer,
)


class RecipeViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsCreatorOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "ingredients__name", "tags__label"]
    ordering_fields = ["created_at", "title"]
    ordering = ["-created_at"]
    lookup_field = "slug"

    def get_queryset(self):
        if self.action in ("list", "retrieve"):
            return Recipe.objects.published().with_relations()
        return Recipe.objects.filter(created_by=self.request.user).with_relations()

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return RecipeWriteSerializer
        if self.action == "retrieve":
            return RecipeDetailSerializer
        return RecipeListSerializer
