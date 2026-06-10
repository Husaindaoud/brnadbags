from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class OrderItemCreate(BaseModel):
    product_id: Optional[int] = None
    product_name: str
    product_image_url: Optional[str] = None
    price: float
    quantity: int


class OrderCreate(BaseModel):
    first_name: str
    last_name: str
    company_name: Optional[str] = None
    country: str
    street_address: str
    apartment: Optional[str] = None
    city: str
    postcode: Optional[str] = None
    phone: str
    email: Optional[str] = None
    order_notes: Optional[str] = None
    items: List[OrderItemCreate]


class OrderStatusUpdate(BaseModel):
    status: str


class OrderItemOut(BaseModel):
    id: int
    product_id: Optional[int]
    product_name: str
    product_image_url: Optional[str]
    price: float
    quantity: float

    class Config:
        from_attributes = True


class OrderOut(BaseModel):
    id: int
    order_ref: str
    status: str
    first_name: str
    last_name: str
    company_name: Optional[str]
    country: str
    street_address: str
    apartment: Optional[str]
    city: str
    postcode: Optional[str]
    phone: str
    email: Optional[str]
    order_notes: Optional[str]
    subtotal: float
    total: float
    created_at: datetime
    items: List[OrderItemOut]

    class Config:
        from_attributes = True
