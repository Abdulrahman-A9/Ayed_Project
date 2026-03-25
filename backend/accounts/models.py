from django.contrib.auth.models import AbstractUser
from django.db import models


class UserRole(models.TextChoices):
	ADMIN = "admin", "Admin"
	EDITOR = "editor", "Editor"


class User(AbstractUser):
	role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.ADMIN)
	display_name = models.CharField(max_length=255, blank=True)

	def __str__(self) -> str:
		return self.display_name or self.username

# Create your models here.
