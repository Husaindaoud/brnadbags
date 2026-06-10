import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import get_current_admin
from ..models.site_settings import SiteSettings
from ..models.user import AdminUser
from ..schemas.site_settings import SiteSettingsOut, SiteSettingsUpdate

router = APIRouter(prefix="/settings", tags=["Site Settings"])

UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")


def _get_or_create_settings(db: Session) -> SiteSettings:
    settings = db.query(SiteSettings).first()
    if not settings:
        settings = SiteSettings(id=1)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("", response_model=SiteSettingsOut)
def get_settings(db: Session = Depends(get_db)):
    return _get_or_create_settings(db)


@router.put("", response_model=SiteSettingsOut)
def update_settings(
    payload: SiteSettingsUpdate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    settings = _get_or_create_settings(db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(settings, field, value)
    db.commit()
    db.refresh(settings)
    return settings


@router.delete("/logo", response_model=SiteSettingsOut)
def delete_logo(
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    settings = _get_or_create_settings(db)
    if settings.logo_url:
        filepath = os.path.join(UPLOADS_DIR, os.path.basename(settings.logo_url))
        if os.path.exists(filepath):
            os.remove(filepath)
        settings.logo_url = None
        db.commit()
        db.refresh(settings)
    return settings


@router.post("/favicon", response_model=SiteSettingsOut)
async def upload_favicon(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    allowed = {"image/jpeg", "image/png", "image/webp", "image/x-icon", "image/vnd.microsoft.icon"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Invalid image type")

    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "ico"
    filename = f"favicon_{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(UPLOADS_DIR, filename)

    os.makedirs(UPLOADS_DIR, exist_ok=True)
    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)

    settings = _get_or_create_settings(db)
    if settings.favicon_url:
        old = os.path.join(UPLOADS_DIR, os.path.basename(settings.favicon_url))
        if os.path.exists(old):
            os.remove(old)
    settings.favicon_url = f"/uploads/{filename}"
    db.commit()
    db.refresh(settings)
    return settings


@router.delete("/favicon", response_model=SiteSettingsOut)
def delete_favicon(
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    settings = _get_or_create_settings(db)
    if settings.favicon_url:
        filepath = os.path.join(UPLOADS_DIR, os.path.basename(settings.favicon_url))
        if os.path.exists(filepath):
            os.remove(filepath)
        settings.favicon_url = None
        db.commit()
        db.refresh(settings)
    return settings


@router.post("/logo", response_model=SiteSettingsOut)
async def upload_logo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    allowed = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Invalid image type")

    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    filename = f"logo_{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(UPLOADS_DIR, filename)

    os.makedirs(UPLOADS_DIR, exist_ok=True)
    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)

    settings = _get_or_create_settings(db)
    settings.logo_url = f"/uploads/{filename}"
    db.commit()
    db.refresh(settings)
    return settings
