from rest_framework import serializers

from users.serializers import UserPublicSerializer

from .models import Recipe, RecipeImage, RecipeIngredient, Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["slug", "label"]
        read_only_fields = fields


class RecipeIngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeIngredient
        fields = ["id", "section", "name", "quantity", "unit", "prep_note", "sort_order"]
        read_only_fields = ["id"]


class RecipeImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeImage
        fields = ["id", "image", "sort_order"]
        read_only_fields = ["id"]


class RecipeListSerializer(serializers.ModelSerializer):
    """Lightweight DTO for feeds and search results."""

    created_by = UserPublicSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    program_display = serializers.CharField(source="get_program_display", read_only=True)

    class Meta:
        model = Recipe
        fields = [
            "id",
            "title",
            "slug",
            "created_by",
            "program",
            "program_display",
            "tags",
            "created_at",
        ]
        read_only_fields = fields


class RecipeDetailSerializer(RecipeListSerializer):
    """Full DTO for the recipe detail page."""

    ingredients = RecipeIngredientSerializer(many=True, read_only=True)
    images = RecipeImageSerializer(many=True, read_only=True)

    class Meta(RecipeListSerializer.Meta):
        fields = RecipeListSerializer.Meta.fields + [
            "instructions",
            "ingredients",
            "images",
            "is_published",
            "updated_at",
        ]


class RecipeIngredientWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeIngredient
        fields = ["section", "name", "quantity", "unit", "prep_note", "sort_order"]


class RecipeWriteSerializer(serializers.ModelSerializer):
    """Input DTO for create/update — nested ingredients on write."""

    slug = serializers.SlugField(read_only=True)
    ingredients = RecipeIngredientWriteSerializer(many=True)
    tag_slugs = serializers.SlugRelatedField(
        slug_field="slug",
        queryset=Tag.objects.all(),
        many=True,
        source="tags",
        required=False,
    )

    class Meta:
        model = Recipe
        fields = [
            "title",
            "slug",
            "instructions",
            "program",
            "ingredients",
            "tag_slugs",
            "is_published",
        ]

    def create(self, validated_data):
        ingredients_data = validated_data.pop("ingredients")
        tags = validated_data.pop("tags", [])
        recipe = Recipe.objects.create(
            created_by=self.context["request"].user,
            **validated_data,
        )
        recipe.tags.set(tags)
        self._save_ingredients(recipe, ingredients_data)
        return recipe

    def update(self, instance, validated_data):
        ingredients_data = validated_data.pop("ingredients", None)
        tags = validated_data.pop("tags", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if tags is not None:
            instance.tags.set(tags)
        if ingredients_data is not None:
            instance.ingredients.all().delete()
            self._save_ingredients(instance, ingredients_data)

        return instance

    def _save_ingredients(self, recipe, ingredients_data):
        RecipeIngredient.objects.bulk_create(
            [RecipeIngredient(recipe=recipe, **item) for item in ingredients_data],
        )
