from pydantic import BaseModel
from typing import Optional, List


class SliderImageUpdate(BaseModel):
    caption: Optional[str] = None
    link: Optional[str] = None
    order: Optional[int] = None


class SliderImageOut(BaseModel):
    id: int
    image_url: str
    caption: Optional[str] = None
    link: Optional[str] = None
    order: int

    model_config = {"from_attributes": True}


class SliderReorderItem(BaseModel):
    id: int
    order: int


class SliderReorderRequest(BaseModel):
    items: List[SliderReorderItem]
