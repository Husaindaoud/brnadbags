from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..core.security import get_current_admin
from ..models.announcement import Announcement
from ..models.user import AdminUser
from ..schemas.announcement import AnnouncementCreate, AnnouncementUpdate, AnnouncementOut

router = APIRouter(prefix="/announcements", tags=["Announcements"])


@router.get("/active", response_model=List[AnnouncementOut])
def get_active_announcements(db: Session = Depends(get_db)):
    return db.query(Announcement).filter(Announcement.is_active == True).all()


@router.get("", response_model=List[AnnouncementOut])
def list_announcements(
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    return db.query(Announcement).order_by(Announcement.created_at.desc()).all()


@router.post("", response_model=AnnouncementOut, status_code=201)
def create_announcement(
    payload: AnnouncementCreate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    ann = Announcement(**payload.model_dump())
    db.add(ann)
    db.commit()
    db.refresh(ann)
    return ann


@router.put("/{ann_id}", response_model=AnnouncementOut)
def update_announcement(
    ann_id: int,
    payload: AnnouncementUpdate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    ann = db.query(Announcement).filter(Announcement.id == ann_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(ann, k, v)
    db.commit()
    db.refresh(ann)
    return ann


@router.patch("/{ann_id}/toggle", response_model=AnnouncementOut)
def toggle_announcement(
    ann_id: int,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    ann = db.query(Announcement).filter(Announcement.id == ann_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    ann.is_active = not ann.is_active
    db.commit()
    db.refresh(ann)
    return ann


@router.delete("/{ann_id}", status_code=204)
def delete_announcement(
    ann_id: int,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    ann = db.query(Announcement).filter(Announcement.id == ann_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    db.delete(ann)
    db.commit()
