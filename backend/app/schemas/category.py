from pydantic import BaseModel
from typing import Optional, List


class CategoryCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    image_url: Optional[str] = None
    parent_id: Optional[int] = None


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    image_url: Optional[str] = None
    parent_id: Optional[int] = None


class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    image_url: Optional[str] = None
    parent_id: Optional[int] = None
    subcategories: List['CategoryOut'] = []

    model_config = {"from_attributes": True}


CategoryOut.model_rebuild()
