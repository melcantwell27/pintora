from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ParseIngredientsView, RecipeViewSet, TagViewSet

router = DefaultRouter()
router.register("recipes", RecipeViewSet, basename="recipe")
router.register("tags", TagViewSet, basename="tag")

urlpatterns = [
    path(
        "recipes/parse-ingredients/",
        ParseIngredientsView.as_view(),
        name="recipe-parse-ingredients",
    ),
    path("", include(router.urls)),
]
