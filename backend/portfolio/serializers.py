from rest_framework import serializers

from .models import Announcement, ContactSubmission, MediaAsset, MediaType, PortfolioSite, Service, Testimonial
from .services import R2StorageService


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ("id", "title", "description", "short_label", "icon", "sort_order", "is_published")


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = ("id", "client_name", "client_role", "quote", "rating", "sort_order", "is_published", "client_photo_url")


class AdminAnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = (
            "id",
            "badge",
            "title",
            "body",
            "cta_label",
            "cta_url",
            "starts_at",
            "ends_at",
            "is_published",
        )


class PortfolioSiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioSite
        exclude = ("owner", "created_at", "updated_at")


class MediaAssetSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = MediaAsset
        fields = (
            "id",
            "media_type",
            "title",
            "description",
            "original_filename",
            "file_key",
            "thumbnail_key",
            "file_url",
            "thumbnail_url",
            "mime_type",
            "size_bytes",
            "duration_seconds",
            "width",
            "height",
            "featured",
            "is_published",
            "sort_order",
            "created_at",
            "category",
            "project_client",
            "project_location",
        )

    def get_file_url(self, obj):
        return R2StorageService().get_object_url(obj.file_key)

    def get_thumbnail_url(self, obj):
        if not obj.thumbnail_key:
            return ""
        return R2StorageService().get_object_url(obj.thumbnail_key)


class AdminMediaAssetSerializer(MediaAssetSerializer):
    class Meta(MediaAssetSerializer.Meta):
        read_only_fields = ("created_at",)


class PublicPortfolioSerializer(serializers.ModelSerializer):
    services = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    videos = serializers.SerializerMethodField()
    announcements = serializers.SerializerMethodField()
    testimonials = serializers.SerializerMethodField()

    class Meta:
        model = PortfolioSite
        fields = (
            "id",
            "brand_name",
            "tagline",
            "hero_title",
            "hero_subtitle",
            "about_title",
            "about_body",
            "services_title",
            "contact_email",
            "contact_phone",
            "base_city",
            "instagram_url",
            "youtube_url",
            "tiktok_url",
            "whatsapp_url",
            "twitter_url",
            "snapchat_url",
            "meta_title",
            "meta_description",
            "services",
            "images",
            "videos",
            "announcements",
            "testimonials",
        )

    def get_services(self, obj):
        return ServiceSerializer(obj.services.filter(is_published=True), many=True).data

    def get_images(self, obj):
        return MediaAssetSerializer(obj.media_assets.filter(is_published=True, media_type=MediaType.IMAGE), many=True).data

    def get_videos(self, obj):
        return MediaAssetSerializer(obj.media_assets.filter(is_published=True, media_type=MediaType.VIDEO), many=True).data

    def get_announcements(self, obj):
        return AdminAnnouncementSerializer(obj.announcements.filter(is_published=True), many=True).data

    def get_testimonials(self, obj):
        return TestimonialSerializer(obj.testimonials.filter(is_published=True), many=True).data


class ContactSubmissionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSubmission
        fields = ("name", "email", "phone", "subject", "message")


class AdminContactSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSubmission
        fields = ("id", "name", "email", "phone", "subject", "message", "status", "created_at")


class PresignUploadSerializer(serializers.Serializer):
    media_type = serializers.ChoiceField(choices=MediaType.choices)
    file_name = serializers.CharField(max_length=255)
    content_type = serializers.CharField(max_length=120)
    size_bytes = serializers.IntegerField(min_value=1)