from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..core.security import get_current_admin
from ..core.utils import save_upload, delete_upload
from ..models.brand import Brand
from ..models.user import AdminUser
from ..schemas.brand import BrandCreate, BrandUpdate, BrandOut

router = APIRouter(prefix="/brands", tags=["Brands"])


@router.get("", response_model=List[BrandOut])
def list_brands(db: Session = Depends(get_db)):
    return db.query(Brand).all()


@router.get("/{brand_id}", response_model=BrandOut)
def get_brand(brand_id: int, db: Session = Depends(get_db)):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand


@router.post("", response_model=BrandOut, status_code=201)
def create_brand(
    payload: BrandCreate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    brand = Brand(name=payload.name, logo_url=payload.logo_url)
    db.add(brand)
    db.commit()
    db.refresh(brand)
    return brand


@router.put("/{brand_id}", response_model=BrandOut)
def update_brand(
    brand_id: int,
    payload: BrandUpdate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(brand, k, v)
    db.commit()
    db.refresh(brand)
    return brand


@router.post("/{brand_id}/logo", response_model=BrandOut)
async def upload_brand_logo(
    brand_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    if brand.logo_url:
        delete_upload(brand.logo_url)
    brand.logo_url = await save_upload(file, prefix="brand")
    db.commit()
    db.refresh(brand)
    return brand


@router.delete("/{brand_id}", status_code=204)
def delete_brand(
    brand_id: int,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    if brand.logo_url:
        delete_upload(brand.logo_url)
    db.delete(brand)
    db.commit()
