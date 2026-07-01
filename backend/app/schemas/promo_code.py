from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime


class PromoCodeCreate(BaseModel):
    code: str
    discount_percent: float
    is_active: bool = True
    max_uses: Optional[int] = None
    expires_at: Optional[datetime] = None

    @field_validator('code')
    @classmethod
    def uppercase_code(cls, v):
        return v.strip().upper()

    @field_validator('discount_percent')
    @classmethod
    def validate_discount(cls, v):
        if not 0 < v <= 100:
            raise ValueError('discount_percent must be between 0 and 100')
        return v


class PromoCodeUpdate(BaseModel):
    code: Optional[str] = None
    discount_percent: Optional[float] = None
    is_active: Optional[bool] = None
    max_uses: Optional[int] = None
    expires_at: Optional[datetime] = None


class PromoCodeOut(BaseModel):
    id: int
    code: str
    discount_percent: float
    is_active: bool
    max_uses: Optional[int]
    uses_count: int
    expires_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class PromoValidateResponse(BaseModel):
    valid: bool
    discount_percent: Optional[float] = None
    message: str
