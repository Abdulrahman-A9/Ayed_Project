from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class PortfolioUserAdmin(UserAdmin):
	fieldsets = UserAdmin.fieldsets + (("Portfolio", {"fields": ("role", "display_name")}),)
	list_display = ("username", "email", "display_name", "role", "is_staff", "is_active")

# Register your models here.
