from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import MeViewSet, UserViewSet

router = DefaultRouter()
router.register("users", UserViewSet, basename="user")
router.register("me", MeViewSet, basename="me")

urlpatterns = [
    path("", include(router.urls)),
]
