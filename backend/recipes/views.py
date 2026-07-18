from drf_spectacular.utils import extend_schema
from rest_framework import filters, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Recipe, Tag
from .parsing import parse_ingredients_text
from .permissions import IsCreatorOrReadOnly
from .serializers import (
    ParseIngredientsRequestSerializer,
    ParseIngredientsResponseSerializer,
    RecipeDetailSerializer,
    RecipeListSerializer,
    RecipeWriteSerializer,
    TagSerializer,
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


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    """Shared dietary/style labels for pickers and filters."""

    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None
    lookup_field = "slug"


class ParseIngredientsView(APIView):
    """Free-form text -> draft structured ingredients. Non-mutating."""

    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=ParseIngredientsRequestSerializer,
        responses=ParseIngredientsResponseSerializer,
        operation_id="recipes_parse_ingredients",
    )
    def post(self, request):
        req = ParseIngredientsRequestSerializer(data=request.data)
        req.is_valid(raise_exception=True)
        ingredients, warnings = parse_ingredients_text(req.validated_data["text"])
        resp = ParseIngredientsResponseSerializer(
            {"ingredients": ingredients, "warnings": warnings}
        )
        return Response(resp.data)
