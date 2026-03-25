from pathlib import Path
from uuid import uuid4

import boto3
from botocore.client import Config
from django.conf import settings
from rest_framework.exceptions import ValidationError

from .models import MediaType


VIDEO_CONTENT_TYPES = {"video/mp4", "video/quicktime", "video/webm", "video/x-matroska"}
IMAGE_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/avif"}
MAX_VIDEO_BYTES = 500 * 1024 * 1024
MAX_IMAGE_BYTES = 25 * 1024 * 1024


class R2StorageService:
    def __init__(self):
        self.bucket = settings.R2_BUCKET_NAME
        endpoint_url = f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
        self.client = boto3.client(
            "s3",
            endpoint_url=endpoint_url,
            aws_access_key_id=settings.R2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
            region_name=settings.R2_REGION,
            config=Config(signature_version="s3v4"),
        )

    def _assert_enabled(self):
        if not all([settings.R2_ACCOUNT_ID, settings.R2_ACCESS_KEY_ID, settings.R2_SECRET_ACCESS_KEY, self.bucket]):
            raise ValidationError("Cloudflare R2 is not configured yet.")

    def validate_upload(self, media_type: str, content_type: str, size_bytes: int):
        if media_type == MediaType.VIDEO:
            if content_type not in VIDEO_CONTENT_TYPES:
                raise ValidationError("Unsupported video format.")
            if size_bytes > MAX_VIDEO_BYTES:
                raise ValidationError("Video size exceeds 500 MB.")
        if media_type == MediaType.IMAGE:
            if content_type not in IMAGE_CONTENT_TYPES:
                raise ValidationError("Unsupported image format.")
            if size_bytes > MAX_IMAGE_BYTES:
                raise ValidationError("Image size exceeds 25 MB.")

    def create_presigned_upload(self, site_id: int, file_name: str, media_type: str, content_type: str, size_bytes: int):
        self._assert_enabled()
        self.validate_upload(media_type, content_type, size_bytes)
        extension = Path(file_name).suffix.lower()
        key = f"portfolio-sites/{site_id}/{media_type}s/{uuid4().hex}{extension}"
        upload_url = self.client.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket": self.bucket,
                "Key": key,
                "ContentType": content_type,
            },
            ExpiresIn=900,
        )
        return {
            "upload_url": upload_url,
            "file_key": key,
            "public_url": self.get_object_url(key),
            "headers": {"Content-Type": content_type},
        }

    def get_object_url(self, key: str):
        if settings.R2_PUBLIC_BASE_URL:
            return f"{settings.R2_PUBLIC_BASE_URL.rstrip('/')}/{key}"

        if not all([settings.R2_ACCOUNT_ID, settings.R2_ACCESS_KEY_ID, settings.R2_SECRET_ACCESS_KEY, self.bucket]):
            return ""

        return self.client.generate_presigned_url(
            ClientMethod="get_object",
            Params={"Bucket": self.bucket, "Key": key},
            ExpiresIn=86400,
        )

    def delete(self, key: str):
        if not key or not all([settings.R2_ACCOUNT_ID, settings.R2_ACCESS_KEY_ID, settings.R2_SECRET_ACCESS_KEY, self.bucket]):
            return
        self.client.delete_object(Bucket=self.bucket, Key=key)