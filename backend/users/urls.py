from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import MeProfileView, MeView, UserViewSet

router = DefaultRouter()
router.register("users", UserViewSet, basename="user")

urlpatterns = [
    path("me/", MeView.as_view(), name="me"),
    path("me/profile/", MeProfileView.as_view(), name="me-profile"),
    path("", include(router.urls)),
]
