from django.contrib import admin

from .models import Recipe, RecipeImage, RecipeIngredient, Tag


class RecipeIngredientInline(admin.TabularInline):
    model = RecipeIngredient
    extra = 3


class RecipeImageInline(admin.TabularInline):
    model = RecipeImage
    extra = 1


@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ("title", "created_by", "program", "is_published", "created_at")
    list_filter = ("is_published", "program", "created_at", "tags")
    search_fields = ("title", "created_by__username", "ingredients__name")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [RecipeIngredientInline, RecipeImageInline]
    filter_horizontal = ("tags",)


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("label", "slug")
    prepopulated_fields = {"slug": ("label",)}
    search_fields = ("label", "slug")
