from sqlalchemy import Column, Integer, String
from ..core.database import Base


class SliderImage(Base):
    __tablename__ = "slider_images"

    id = Column(Integer, primary_key=True, index=True)
    image_url = Column(String, nullable=False)
    caption = Column(String, nullable=True)
    link = Column(String, nullable=True)
    order = Column(Integer, default=0)
