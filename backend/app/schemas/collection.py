from pydantic import BaseModel
from typing import Optional


class CollectionCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    is_new: bool = False


class CollectionUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    is_new: Optional[bool] = None


class CollectionOut(BaseModel):
    id: int
    name: str
    slug: str
    is_new: bool

    model_config = {"from_attributes": True}
