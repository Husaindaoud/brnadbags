from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import get_current_admin
from ..core.utils import save_upload, delete_upload, ALLOWED_IMAGE_TYPES, ALLOWED_FAVICON_TYPES
from ..models.site_settings import SiteSettings
from ..models.user import AdminUser
from ..schemas.site_settings import SiteSettingsOut, SiteSettingsUpdate

router = APIRouter(prefix="/settings", tags=["Site Settings"])


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


@router.post("/logo", response_model=SiteSettingsOut)
async def upload_logo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    settings = _get_or_create_settings(db)
    if settings.logo_url:
        delete_upload(settings.logo_url)
    settings.logo_url = await save_upload(file, prefix="logo", allowed_types=ALLOWED_IMAGE_TYPES)
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
        delete_upload(settings.logo_url)
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
    settings = _get_or_create_settings(db)
    if settings.favicon_url:
        delete_upload(settings.favicon_url)
    settings.favicon_url = await save_upload(file, prefix="favicon", allowed_types=ALLOWED_FAVICON_TYPES)
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
        delete_upload(settings.favicon_url)
        settings.favicon_url = None
        db.commit()
        db.refresh(settings)
    return settings
