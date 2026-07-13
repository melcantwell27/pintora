from django.conf import settings
from django.db import models
from django.utils.text import slugify


class Tag(models.Model):
    """Dietary / style labels (vegan, high-protein, etc.) — supports future filtering."""

    slug = models.SlugField(max_length=50, unique=True)
    label = models.CharField(max_length=50)

    class Meta:
        ordering = ["label"]

    def __str__(self) -> str:
        return self.label


class RecipeQuerySet(models.QuerySet):
    def published(self):
        return self.filter(is_published=True)

    def with_relations(self):
        return self.select_related("created_by").prefetch_related(
            "tags",
            "images",
            "ingredients",
        )


class Recipe(models.Model):
    class Program(models.TextChoices):
        ICE_CREAM = "ice_cream", "Ice Cream"
        LITE_ICE_CREAM = "lite_ice_cream", "Lite Ice Cream"
        SORBET = "sorbet", "Sorbet"
        GELATO = "gelato", "Gelato"
        SMOOTHIE_BOWL = "smoothie_bowl", "Smoothie Bowl"
        MILKSHAKE = "milkshake", "Milkshake"
        MIX_IN = "mix_in", "Mix-in"
        FROZEN_YOGURT = "frozen_yogurt", "Frozen Yogurt"
        ITALIAN_ICE = "italian_ice", "Italian Ice"

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="recipes",
    )
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    instructions = models.TextField()
    program = models.CharField(
        max_length=20,
        choices=Program.choices,
        blank=True,
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name="recipes")
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = RecipeQuerySet.as_manager()

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["is_published", "-created_at"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)[:200] or "recipe"
            slug = base
            counter = 1
            while Recipe.objects.exclude(pk=self.pk).filter(slug=slug).exists():
                counter += 1
                slug = f"{base}-{counter}"
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.title


class RecipeIngredient(models.Model):
    """Structured ingredients — searchable (e.g. recipes containing 'almond')."""

    class Section(models.TextChoices):
        BASE = "base", "Base"
        MIX_IN = "mix_in", "Mix-in"

    recipe = models.ForeignKey(
        Recipe,
        on_delete=models.CASCADE,
        related_name="ingredients",
    )
    section = models.CharField(
        max_length=10,
        choices=Section.choices,
        default=Section.BASE,
    )
    name = models.CharField(max_length=200)
    quantity = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    unit = models.CharField(max_length=50, blank=True)
    prep_note = models.CharField(max_length=200, blank=True)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]
        indexes = [
            models.Index(fields=["name"]),
        ]

    def __str__(self) -> str:
        return self.name


class RecipeImage(models.Model):
    recipe = models.ForeignKey(
        Recipe,
        on_delete=models.CASCADE,
        related_name="images",
    )
    image = models.ImageField(upload_to="recipes/")
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self) -> str:
        return f"{self.recipe.title} image {self.id}"
