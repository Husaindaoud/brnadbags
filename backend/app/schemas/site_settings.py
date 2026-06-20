from pydantic import BaseModel
from typing import Optional


class SiteSettingsOut(BaseModel):
    id: int
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None
    whatsapp_number: Optional[str] = None
    instagram_url: Optional[str] = None
    footer_description: Optional[str] = None
    notification_emails: Optional[str] = None

    model_config = {"from_attributes": True}


class SiteSettingsUpdate(BaseModel):
    whatsapp_number: Optional[str] = None
    instagram_url: Optional[str] = None
    footer_description: Optional[str] = None
    notification_emails: Optional[str] = None
