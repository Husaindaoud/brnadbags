from sqlalchemy import Column, Integer, String
from ..core.database import Base


class SiteSettings(Base):
    __tablename__ = "site_settings"

    id = Column(Integer, primary_key=True, default=1)
    logo_url = Column(String, nullable=True)
    favicon_url = Column(String, nullable=True)
    whatsapp_number = Column(String, nullable=True)
    instagram_url = Column(String, nullable=True)
    footer_description = Column(String, nullable=True)
    notification_emails = Column(String, nullable=True)
