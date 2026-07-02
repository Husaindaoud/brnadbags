from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from ..core.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    discount_percent = Column(Float, nullable=True)
    quantity = Column(Integer, default=0)
    is_sold_out = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    sizes = Column(JSON, nullable=True)

    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    subcategory_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=True)
    collection_id = Column(Integer, ForeignKey("collections.id"), nullable=True)

    category = relationship("Category", foreign_keys=[category_id], back_populates="products")
    subcategory = relationship("Category", foreign_keys=[subcategory_id])
    brand = relationship("Brand", back_populates="products")
    collection = relationship("Collection", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")

    @property
    def final_price(self) -> float:
        if self.discount_percent:
            return round(self.price * (1 - self.discount_percent / 100), 2)
        return self.price

    @property
    def primary_image_url(self):
        for img in self.images:
            if img.is_primary:
                return img.image_url
        return self.images[0].image_url if self.images else None


class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    image_url = Column(String, nullable=False)
    is_primary = Column(Boolean, default=False)

    product = relationship("Product", back_populates="images")
