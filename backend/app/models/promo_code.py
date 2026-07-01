from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from datetime import datetime
from ..core.database import Base


class PromoCode(Base):
    __tablename__ = 'promo_codes'

    id               = Column(Integer, primary_key=True)
    code             = Column(String, unique=True, nullable=False)
    discount_percent = Column(Float, nullable=False)
    is_active        = Column(Boolean, default=True)
    max_uses         = Column(Integer, nullable=True)
    uses_count       = Column(Integer, default=0)
    expires_at       = Column(DateTime, nullable=True)
    created_at       = Column(DateTime, default=datetime.utcnow)
