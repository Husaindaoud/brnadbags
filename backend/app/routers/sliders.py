from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.database import get_db
from ..core.security import get_current_admin
from ..core.utils import save_upload, delete_upload
from ..models.slider import SliderImage
from ..models.user import AdminUser
from ..schemas.slider import SliderImageUpdate, SliderImageOut, SliderReorderRequest

router = APIRouter(prefix="/sliders", tags=["Slider Images"])


@router.get("", response_model=List[SliderImageOut])
def list_sliders(db: Session = Depends(get_db)):
    return db.query(SliderImage).order_by(SliderImage.order).all()


@router.post("", response_model=SliderImageOut, status_code=201)
async def upload_slider(
    file: UploadFile = File(...),
    caption: Optional[str] = Form(None),
    link: Optional[str] = Form(None),
    order: int = Form(0),
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    url = await save_upload(file, prefix="slide")
    slide = SliderImage(image_url=url, caption=caption, link=link, order=order)
    db.add(slide)
    db.commit()
    db.refresh(slide)
    return slide


@router.put("/{slider_id}", response_model=SliderImageOut)
def update_slider(
    slider_id: int,
    payload: SliderImageUpdate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    slide = db.query(SliderImage).filter(SliderImage.id == slider_id).first()
    if not slide:
        raise HTTPException(status_code=404, detail="Slider image not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(slide, k, v)
    db.commit()
    db.refresh(slide)
    return slide


@router.put("/reorder/batch", response_model=List[SliderImageOut])
def reorder_sliders(
    payload: SliderReorderRequest,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    updated = []
    for item in payload.items:
        slide = db.query(SliderImage).filter(SliderImage.id == item.id).first()
        if slide:
            slide.order = item.order
            updated.append(slide)
    db.commit()
    for s in updated:
        db.refresh(s)
    return updated


@router.delete("/{slider_id}", status_code=204)
def delete_slider(
    slider_id: int,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    slide = db.query(SliderImage).filter(SliderImage.id == slider_id).first()
    if not slide:
        raise HTTPException(status_code=404, detail="Slider image not found")
    delete_upload(slide.image_url)
    db.delete(slide)
    db.commit()
