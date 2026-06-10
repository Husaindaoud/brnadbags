from pydantic import BaseModel
from typing import Optional


class CategoryCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    image_url: Optional[str] = None


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    image_url: Optional[str] = None


class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    image_url: Optional[str] = None

    model_config = {"from_attributes": True}
