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
            "special_prep",
            "ingredients",
            "images",
            "is_published",
            "updated_at",
            "ingredients_text",
        ]


class RecipeIngredientWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeIngredient
        fields = ["section", "name", "quantity", "unit", "prep_note", "sort_order"]


class ParsedIngredientSerializer(serializers.Serializer):
    section = serializers.ChoiceField(choices=RecipeIngredient.Section.choices)
    name = serializers.CharField()
    quantity = serializers.DecimalField(
        max_digits=8, decimal_places=2, allow_null=True
    )
    unit = serializers.CharField(allow_blank=True)
    sort_order = serializers.IntegerField()


class ParseIngredientsRequestSerializer(serializers.Serializer):
    text = serializers.CharField(allow_blank=False, trim_whitespace=True)


class ParseIngredientsResponseSerializer(serializers.Serializer):
    ingredients = ParsedIngredientSerializer(many=True)
    warnings = serializers.ListField(child=serializers.CharField())


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
            "special_prep",
            "program",
            "ingredients",
            "ingredients_text",
            "tag_slugs",
            "is_published",
        ]

    def validate(self, attrs):
        is_published = attrs.get(
            "is_published",
            self.instance.is_published if self.instance else True,
        )
        if "ingredients" in attrs:
            count = len(attrs["ingredients"])
        elif self.instance is not None:
            count = self.instance.ingredients.count()
        else:
            count = 0
        if is_published and count == 0:
            raise serializers.ValidationError(
                {"ingredients": "Add at least one ingredient before publishing."}
            )
        return attrs

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
