from django.conf import settings
from django.db import models


class TimeStampedModel(models.Model):
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		abstract = True


class PortfolioSite(TimeStampedModel):
	owner = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="portfolio_site")
	brand_name = models.CharField(max_length=255, default="Aerial Frames")
	tagline = models.CharField(max_length=255, default="Premium drone cinematography and aerial storytelling")
	hero_title = models.CharField(max_length=255, default="Drone films that make every horizon feel cinematic.")
	hero_subtitle = models.TextField(default="Luxury aerial visuals for brands, destinations, events, and private clients.")
	about_title = models.CharField(max_length=255, default="About")
	about_body = models.TextField(default="I craft aerial imagery that turns landscapes, architecture, and events into immersive visual stories.")
	services_title = models.CharField(max_length=255, default="Services")
	contact_email = models.EmailField(blank=True)
	contact_phone = models.CharField(max_length=50, blank=True)
	base_city = models.CharField(max_length=120, blank=True)
	instagram_url = models.URLField(blank=True)
	youtube_url = models.URLField(blank=True)
	tiktok_url = models.URLField(blank=True)
	whatsapp_url = models.URLField(blank=True)
	twitter_url = models.URLField(blank=True)
	snapchat_url = models.URLField(blank=True)
	meta_title = models.CharField(max_length=255, blank=True)
	meta_description = models.CharField(max_length=255, blank=True)

	def __str__(self) -> str:
		return self.brand_name


class Service(TimeStampedModel):
	site = models.ForeignKey(PortfolioSite, on_delete=models.CASCADE, related_name="services")
	title = models.CharField(max_length=255)
	description = models.TextField()
	short_label = models.CharField(max_length=120, blank=True)
	icon = models.CharField(max_length=50, blank=True, default="camera")
	sort_order = models.PositiveIntegerField(default=0)
	is_published = models.BooleanField(default=True)

	class Meta:
		ordering = ("sort_order", "created_at")

	def __str__(self) -> str:
		return self.title


class MediaType(models.TextChoices):
	IMAGE = "image", "Image"
	VIDEO = "video", "Video"


class MediaAsset(TimeStampedModel):
	site = models.ForeignKey(PortfolioSite, on_delete=models.CASCADE, related_name="media_assets")
	media_type = models.CharField(max_length=20, choices=MediaType.choices)
	title = models.CharField(max_length=255)
	description = models.TextField(blank=True)
	original_filename = models.CharField(max_length=255)
	file_key = models.CharField(max_length=500, unique=True)
	thumbnail_key = models.CharField(max_length=500, blank=True)
	mime_type = models.CharField(max_length=120)
	size_bytes = models.BigIntegerField()
	duration_seconds = models.PositiveIntegerField(null=True, blank=True)
	width = models.PositiveIntegerField(null=True, blank=True)
	height = models.PositiveIntegerField(null=True, blank=True)
	featured = models.BooleanField(default=False)
	is_published = models.BooleanField(default=True)
	sort_order = models.PositiveIntegerField(default=0)
	category = models.CharField(max_length=30, blank=True, default="")
	project_client = models.CharField(max_length=255, blank=True)
	project_location = models.CharField(max_length=255, blank=True)

	class Meta:
		ordering = ("sort_order", "-created_at")

	def __str__(self) -> str:
		return f"{self.media_type}: {self.title}"


class Announcement(TimeStampedModel):
	site = models.ForeignKey(PortfolioSite, on_delete=models.CASCADE, related_name="announcements")
	badge = models.CharField(max_length=80, blank=True)
	title = models.CharField(max_length=255)
	body = models.TextField()
	cta_label = models.CharField(max_length=80, blank=True)
	cta_url = models.URLField(blank=True)
	starts_at = models.DateTimeField(null=True, blank=True)
	ends_at = models.DateTimeField(null=True, blank=True)
	is_published = models.BooleanField(default=True)

	class Meta:
		ordering = ("-created_at",)

	def __str__(self) -> str:
		return self.title


class Testimonial(TimeStampedModel):
	site = models.ForeignKey(PortfolioSite, on_delete=models.CASCADE, related_name="testimonials")
	client_name = models.CharField(max_length=255)
	client_role = models.CharField(max_length=255, blank=True)
	quote = models.TextField()
	rating = models.PositiveSmallIntegerField(default=5)
	sort_order = models.PositiveIntegerField(default=0)
	is_published = models.BooleanField(default=True)
	client_photo_url = models.URLField(blank=True)

	class Meta:
		ordering = ("sort_order", "created_at")

	def __str__(self) -> str:
		return self.client_name


class ContactStatus(models.TextChoices):
	NEW = "new", "New"
	READ = "read", "Read"
	REPLIED = "replied", "Replied"
	ARCHIVED = "archived", "Archived"


class ContactSubmission(TimeStampedModel):
	site = models.ForeignKey(PortfolioSite, on_delete=models.CASCADE, related_name="contact_submissions")
	name = models.CharField(max_length=255)
	email = models.EmailField()
	phone = models.CharField(max_length=50, blank=True)
	subject = models.CharField(max_length=255, blank=True)
	message = models.TextField()
	status = models.CharField(max_length=20, choices=ContactStatus.choices, default=ContactStatus.NEW)

	class Meta:
		ordering = ("-created_at",)

	def __str__(self) -> str:
		return f"{self.name} - {self.email}"

# Create your models here.
