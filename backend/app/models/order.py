import random
import string
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base


def _gen_ref():
    chars = string.ascii_uppercase + string.digits
    return 'ORD-' + ''.join(random.choices(chars, k=7))


class Order(Base):
    __tablename__ = 'orders'

    id          = Column(Integer, primary_key=True)
    order_ref   = Column(String, unique=True, nullable=False)
    status      = Column(String, default='pending')   # pending | confirmed | shipped | delivered | cancelled

    first_name    = Column(String, nullable=False)
    last_name     = Column(String, nullable=False)
    company_name  = Column(String, nullable=True)
    country       = Column(String, nullable=False)
    street_address = Column(String, nullable=False)
    apartment     = Column(String, nullable=True)
    city          = Column(String, nullable=False)
    postcode      = Column(String, nullable=True)
    phone         = Column(String, nullable=False)
    email         = Column(String, nullable=True)
    order_notes   = Column(Text, nullable=True)

    subtotal    = Column(Float, nullable=False)
    total       = Column(Float, nullable=False)
    created_at  = Column(DateTime, default=datetime.utcnow)

    items = relationship('OrderItem', back_populates='order', cascade='all, delete-orphan')


class OrderItem(Base):
    __tablename__ = 'order_items'

    id               = Column(Integer, primary_key=True)
    order_id         = Column(Integer, ForeignKey('orders.id'), nullable=False)
    product_id       = Column(Integer, ForeignKey('products.id'), nullable=True)
    product_name     = Column(String, nullable=False)
    product_image_url = Column(String, nullable=True)
    price            = Column(Float, nullable=False)
    quantity         = Column(Integer, nullable=False)

    order = relationship('Order', back_populates='items')
