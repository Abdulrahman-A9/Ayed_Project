from django.conf import settings
from django.core.mail import send_mail
from django.db.models import Prefetch
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminRole

from .models import Announcement, ContactSubmission, MediaAsset, MediaType, PortfolioSite, Service, Testimonial
from .serializers import (
	AdminAnnouncementSerializer,
	AdminContactSubmissionSerializer,
	AdminMediaAssetSerializer,
	ContactSubmissionCreateSerializer,
	PortfolioSiteSerializer,
	PresignUploadSerializer,
	PublicPortfolioSerializer,
	ServiceSerializer,
	TestimonialSerializer,
)
from .services import R2StorageService


def get_or_create_site_for_user(user):
	site, _ = PortfolioSite.objects.get_or_create(
		owner=user,
		defaults={
			"brand_name": user.display_name or "Drone Vision Studio",
			"contact_email": user.email,
		},
	)
	return site


class PublicPortfolioView(APIView):
	permission_classes = [permissions.AllowAny]

	def get(self, request):
		site = (
			PortfolioSite.objects.select_related("owner")
			.prefetch_related(
				Prefetch("services", queryset=Service.objects.filter(is_published=True)),
				Prefetch("media_assets", queryset=MediaAsset.objects.filter(is_published=True)),
				Prefetch("announcements", queryset=Announcement.objects.filter(is_published=True)),
				Prefetch("testimonials", queryset=Testimonial.objects.filter(is_published=True)),
			)
			.first()
		)

		if not site:
			return Response(
				{
					"detail": "No portfolio has been published yet.",
					"site": None,
				}
			)

		serializer = PublicPortfolioSerializer(site, context={"request": request})
		return Response(serializer.data)


class AdminSiteView(APIView):
	permission_classes = [permissions.IsAuthenticated, IsAdminRole]

	def get(self, request):
		site = get_or_create_site_for_user(request.user)
		return Response(PortfolioSiteSerializer(site, context={"request": request}).data)

	def patch(self, request):
		site = get_or_create_site_for_user(request.user)
		serializer = PortfolioSiteSerializer(site, data=request.data, partial=True, context={"request": request})
		serializer.is_valid(raise_exception=True)
		serializer.save()
		return Response(serializer.data)


class ServiceViewSet(viewsets.ModelViewSet):
	serializer_class = ServiceSerializer
	permission_classes = [permissions.IsAuthenticated, IsAdminRole]

	def get_queryset(self):
		return Service.objects.filter(site=get_or_create_site_for_user(self.request.user))

	def perform_create(self, serializer):
		serializer.save(site=get_or_create_site_for_user(self.request.user))


class TestimonialViewSet(viewsets.ModelViewSet):
	serializer_class = TestimonialSerializer
	permission_classes = [permissions.IsAuthenticated, IsAdminRole]

	def get_queryset(self):
		return Testimonial.objects.filter(site=get_or_create_site_for_user(self.request.user))

	def perform_create(self, serializer):
		serializer.save(site=get_or_create_site_for_user(self.request.user))


class AnnouncementViewSet(viewsets.ModelViewSet):
	serializer_class = AdminAnnouncementSerializer
	permission_classes = [permissions.IsAuthenticated, IsAdminRole]

	def get_queryset(self):
		return Announcement.objects.filter(site=get_or_create_site_for_user(self.request.user))

	def perform_create(self, serializer):
		serializer.save(site=get_or_create_site_for_user(self.request.user))


class MediaAssetViewSet(viewsets.ModelViewSet):
	serializer_class = AdminMediaAssetSerializer
	permission_classes = [permissions.IsAuthenticated, IsAdminRole]

	def get_queryset(self):
		queryset = MediaAsset.objects.filter(site=get_or_create_site_for_user(self.request.user))
		media_type = self.request.query_params.get("media_type")
		if media_type in {MediaType.IMAGE, MediaType.VIDEO}:
			queryset = queryset.filter(media_type=media_type)
		return queryset

	def perform_create(self, serializer):
		serializer.save(site=get_or_create_site_for_user(self.request.user))

	def perform_destroy(self, instance):
		storage = R2StorageService()
		storage.delete(instance.file_key)
		if instance.thumbnail_key:
			storage.delete(instance.thumbnail_key)
		instance.delete()


class ContactSubmissionView(APIView):
	permission_classes = [permissions.AllowAny]

	def post(self, request):
		site = PortfolioSite.objects.first()
		if not site:
			return Response({"detail": "Portfolio not found."}, status=status.HTTP_404_NOT_FOUND)

		serializer = ContactSubmissionCreateSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		submission = serializer.save(site=site)

		if site.contact_email:
			send_mail(
				subject=f"New portfolio inquiry: {submission.subject or submission.name}",
				message=submission.message,
				from_email=settings.DEFAULT_FROM_EMAIL,
				recipient_list=[site.contact_email],
				fail_silently=True,
			)

		return Response({"detail": "Message sent successfully."}, status=status.HTTP_201_CREATED)


class ContactSubmissionAdminViewSet(viewsets.ReadOnlyModelViewSet):
	serializer_class = AdminContactSubmissionSerializer
	permission_classes = [permissions.IsAuthenticated, IsAdminRole]

	def get_queryset(self):
		return ContactSubmission.objects.filter(site=get_or_create_site_for_user(self.request.user))

	@action(detail=True, methods=["patch"])
	def mark_read(self, request, pk=None):
		submission = self.get_object()
		submission.status = request.data.get("status", submission.status)
		submission.save(update_fields=["status", "updated_at"])
		return Response(self.get_serializer(submission).data)


class PresignUploadView(APIView):
	permission_classes = [permissions.IsAuthenticated, IsAdminRole]

	def post(self, request):
		serializer = PresignUploadSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		site = get_or_create_site_for_user(request.user)
		storage = R2StorageService()
		payload = storage.create_presigned_upload(
			site_id=site.id,
			file_name=serializer.validated_data["file_name"],
			media_type=serializer.validated_data["media_type"],
			content_type=serializer.validated_data["content_type"],
			size_bytes=serializer.validated_data["size_bytes"],
		)
		return Response(payload, status=status.HTTP_201_CREATED)

# Create your views here.
