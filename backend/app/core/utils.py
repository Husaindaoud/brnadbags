import os
import re
import uuid
from fastapi import UploadFile, HTTPException

UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return re.sub(r"^-+|-+$", "", text)


async def save_upload(file: UploadFile, prefix: str = "img") -> str:
    """Saves an uploaded image file and returns its URL path (/uploads/filename)."""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid file type: {file.content_type}")
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "jpg"
    filename = f"{prefix}_{uuid.uuid4().hex}.{ext}"
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    content = await file.read()
    with open(os.path.join(UPLOADS_DIR, filename), "wb") as f:
        f.write(content)
    return f"/uploads/{filename}"


def delete_upload(url: str):
    """Deletes a file from the uploads directory given its URL path."""
    if not url:
        return
    filename = url.lstrip("/uploads/").split("/")[-1]
    filepath = os.path.join(UPLOADS_DIR, filename)
    if os.path.exists(filepath):
        os.remove(filepath)
