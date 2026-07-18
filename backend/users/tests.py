from rest_framework import status
from rest_framework.test import APITestCase

from .models import User


class MeEndpointTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="mel",
            email="mel@example.com",
            password="test-pass-123",
        )

    def test_me_requires_authentication(self):
        response = self.client.get("/api/me/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_me_returns_a_single_object(self):
        self.client.force_authenticate(self.user)
        response = self.client.get("/api/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.json(), dict)
        self.assertEqual(response.json()["username"], "mel")

    def test_profile_patch_updates_bio(self):
        self.client.force_authenticate(self.user)
        response = self.client.patch(
            "/api/me/profile/",
            {"bio": "Creami enthusiast"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.bio, "Creami enthusiast")

    def test_profile_patch_cannot_change_readonly_fields(self):
        self.client.force_authenticate(self.user)
        response = self.client.patch(
            "/api/me/profile/",
            {"username": "hijacked"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, "mel")
