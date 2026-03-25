from django.contrib import admin

from .models import Announcement, ContactSubmission, MediaAsset, PortfolioSite, Service, Testimonial


@admin.register(PortfolioSite)
class PortfolioSiteAdmin(admin.ModelAdmin):
	list_display = ("brand_name", "owner", "contact_email", "base_city", "updated_at")


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
	list_display = ("title", "site", "sort_order", "is_published")
	list_filter = ("is_published",)


@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
	list_display = ("title", "site", "media_type", "size_bytes", "featured", "is_published")
	list_filter = ("media_type", "is_published", "featured")
	search_fields = ("title", "original_filename", "file_key")


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
	list_display = ("title", "site", "is_published", "starts_at", "ends_at")


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
	list_display = ("client_name", "client_role", "site", "rating", "is_published")


@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
	list_display = ("name", "email", "site", "status", "created_at")
	list_filter = ("status",)

# Register your models here.
