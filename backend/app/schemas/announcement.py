from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AnnouncementCreate(BaseModel):
    title: str
    message: str
    type: str = "discount"  # "discount" | "new_collection"
    bg_color: str = "#6B7C45"
    is_active: bool = True


class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    type: Optional[str] = None
    bg_color: Optional[str] = None
    is_active: Optional[bool] = None


class AnnouncementOut(BaseModel):
    id: int
    title: str
    message: str
    type: str
    bg_color: str = "#6B7C45"
    is_active: bool
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
