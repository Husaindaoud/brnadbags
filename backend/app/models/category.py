from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    image_url = Column(String, nullable=True)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)

    products = relationship(
        "Product",
        back_populates="category",
        foreign_keys="[Product.category_id]",
    )
    subcategories = relationship(
        "Category",
        foreign_keys="[Category.parent_id]",
        back_populates="parent_cat",
    )
    parent_cat = relationship(
        "Category",
        foreign_keys="[Category.parent_id]",
        back_populates="subcategories",
        remote_side="[Category.id]",
    )
