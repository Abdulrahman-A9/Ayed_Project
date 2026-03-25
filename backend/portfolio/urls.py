from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminSiteView,
    AnnouncementViewSet,
    ContactSubmissionAdminViewSet,
    ContactSubmissionView,
    MediaAssetViewSet,
    PresignUploadView,
    PublicPortfolioView,
    ServiceViewSet,
    TestimonialViewSet,
)

router = DefaultRouter()
router.register("admin/services", ServiceViewSet, basename="admin-services")
router.register("admin/testimonials", TestimonialViewSet, basename="admin-testimonials")
router.register("admin/announcements", AnnouncementViewSet, basename="admin-announcements")
router.register("admin/media", MediaAssetViewSet, basename="admin-media")
router.register("admin/contacts", ContactSubmissionAdminViewSet, basename="admin-contacts")

urlpatterns = [
    path("public/portfolio/", PublicPortfolioView.as_view(), name="public-portfolio"),
    path("public/contact/", ContactSubmissionView.as_view(), name="public-contact"),
    path("admin/site/", AdminSiteView.as_view(), name="admin-site"),
    path("admin/uploads/presign/", PresignUploadView.as_view(), name="admin-presign-upload"),
    path("", include(router.urls)),
]