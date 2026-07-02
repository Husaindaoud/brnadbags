from pydantic import BaseModel, field_validator, model_validator
from typing import Optional, List


class ProductImageOut(BaseModel):
    id: int
    product_id: int
    image_url: str
    is_primary: bool

    model_config = {"from_attributes": True}


class CategoryShort(BaseModel):
    id: int
    name: str
    slug: str
    parent_id: Optional[int] = None

    model_config = {"from_attributes": True}


class BrandShort(BaseModel):
    id: int
    name: str
    logo_url: Optional[str] = None

    model_config = {"from_attributes": True}


class CollectionShort(BaseModel):
    id: int
    name: str
    slug: str
    is_new: bool

    model_config = {"from_attributes": True}


class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    discount_percent: Optional[float] = None
    quantity: int = 0
    is_active: bool = True
    category_id: Optional[int] = None
    subcategory_id: Optional[int] = None
    brand_id: Optional[int] = None
    collection_id: Optional[int] = None
    sizes: Optional[List[str]] = None

    @field_validator("discount_percent")
    @classmethod
    def validate_discount(cls, v):
        if v is not None and not (0 <= v <= 100):
            raise ValueError("discount_percent must be between 0 and 100")
        return v

    @field_validator("price")
    @classmethod
    def validate_price(cls, v):
        if v < 0:
            raise ValueError("price must be non-negative")
        return v


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    discount_percent: Optional[float] = None
    quantity: Optional[int] = None
    is_active: Optional[bool] = None
    category_id: Optional[int] = None
    subcategory_id: Optional[int] = None
    brand_id: Optional[int] = None
    collection_id: Optional[int] = None
    sizes: Optional[List[str]] = None


class ProductOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    discount_percent: Optional[float] = None
    final_price: float
    quantity: int
    is_sold_out: bool
    is_active: bool
    primary_image_url: Optional[str] = None
    sizes: Optional[List[str]] = None
    category: Optional[CategoryShort] = None
    subcategory: Optional[CategoryShort] = None
    brand: Optional[BrandShort] = None
    collection: Optional[CollectionShort] = None
    images: List[ProductImageOut] = []

    model_config = {"from_attributes": True}
