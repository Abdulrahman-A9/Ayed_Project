from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import PortfolioSite, Service


class PortfolioApiTests(APITestCase):
	def setUp(self):
		self.user = get_user_model().objects.create_user(
			username="owner",
			password="StrongPassword123!",
			role="admin",
		)
		self.site = PortfolioSite.objects.create(owner=self.user, brand_name="Skyline Studio")
		Service.objects.create(site=self.site, title="Aerial Coverage", description="Drone capture")

	def test_public_portfolio_returns_site_payload(self):
		response = self.client.get("/api/v1/public/portfolio/")

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data["brand_name"], "Skyline Studio")
		self.assertEqual(len(response.data["services"]), 1)

	def test_contact_submission_creates_record(self):
		response = self.client.post(
			"/api/v1/public/contact/",
			{
				"name": "Client",
				"email": "client@example.com",
				"message": "Need drone coverage.",
			},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(self.site.contact_submissions.count(), 1)

# Create your tests here.
