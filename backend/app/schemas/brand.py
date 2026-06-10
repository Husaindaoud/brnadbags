from pydantic import BaseModel
from typing import Optional


class BrandCreate(BaseModel):
    name: str
    logo_url: Optional[str] = None


class BrandUpdate(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[str] = None


class BrandOut(BaseModel):
    id: int
    name: str
    logo_url: Optional[str] = None

    model_config = {"from_attributes": True}
