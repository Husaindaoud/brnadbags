import os
import re
import uuid
import boto3
from botocore.config import Config
from fastapi import UploadFile, HTTPException
from .config import get_settings

UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_FAVICON_TYPES = ALLOWED_IMAGE_TYPES | {"image/x-icon", "image/vnd.microsoft.icon"}


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return re.sub(r"^-+|-+$", "", text)


def _r2_client():
    s = get_settings()
    return boto3.client(
        "s3",
        endpoint_url=f"https://{s.r2_account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=s.r2_access_key_id,
        aws_secret_access_key=s.r2_secret_access_key,
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )


def _r2_enabled() -> bool:
    s = get_settings()
    return bool(s.r2_account_id and s.r2_bucket_name and s.r2_access_key_id)


async def save_upload(
    file: UploadFile,
    prefix: str = "img",
    allowed_types: set = None,
) -> str:
    types = allowed_types or ALLOWED_IMAGE_TYPES
    if file.content_type not in types:
        raise HTTPException(status_code=400, detail=f"Invalid file type: {file.content_type}")

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "jpg"
    filename = f"{prefix}_{uuid.uuid4().hex}.{ext}"
    content = await file.read()

    if _r2_enabled():
        s = get_settings()
        _r2_client().put_object(
            Bucket=s.r2_bucket_name,
            Key=filename,
            Body=content,
            ContentType=file.content_type or "image/jpeg",
        )
        return f"{s.r2_public_url.rstrip('/')}/{filename}"

    # Local fallback (development)
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    with open(os.path.join(UPLOADS_DIR, filename), "wb") as f:
        f.write(content)
    return f"/uploads/{filename}"


def delete_upload(url: str):
    if not url:
        return
    if _r2_enabled() and url.startswith("http"):
        key = url.split("/")[-1]
        try:
            s = get_settings()
            _r2_client().delete_object(Bucket=s.r2_bucket_name, Key=key)
        except Exception as e:
            print(f"[r2] delete failed for {key}: {e}")
    else:
        filename = url.lstrip("/").split("/")[-1]
        filepath = os.path.join(UPLOADS_DIR, filename)
        if os.path.exists(filepath):
            os.remove(filepath)
