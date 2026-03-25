from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase


class AuthApiTests(APITestCase):
	def setUp(self):
		self.user = get_user_model().objects.create_user(
			username="admin",
			password="StrongPassword123!",
			role="admin",
			email="admin@example.com",
		)

	def test_admin_can_login_and_receive_access_token(self):
		response = self.client.post(
			"/api/v1/auth/login/",
			{"username": "admin", "password": "StrongPassword123!"},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertIn("access", response.data)

# Create your tests here.
