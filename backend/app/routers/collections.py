from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..core.security import get_current_admin
from ..core.utils import slugify
from ..models.collection import Collection
from ..models.user import AdminUser
from ..schemas.collection import CollectionCreate, CollectionUpdate, CollectionOut

router = APIRouter(prefix="/collections", tags=["Collections"])


@router.get("", response_model=List[CollectionOut])
def list_collections(db: Session = Depends(get_db)):
    return db.query(Collection).all()


@router.get("/{collection_id}", response_model=CollectionOut)
def get_collection(collection_id: int, db: Session = Depends(get_db)):
    col = db.query(Collection).filter(Collection.id == collection_id).first()
    if not col:
        raise HTTPException(status_code=404, detail="Collection not found")
    return col


@router.post("", response_model=CollectionOut, status_code=201)
def create_collection(
    payload: CollectionCreate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    slug = payload.slug or slugify(payload.name)
    if db.query(Collection).filter(Collection.slug == slug).first():
        raise HTTPException(status_code=400, detail="Collection with this slug already exists")
    col = Collection(name=payload.name, slug=slug, is_new=payload.is_new)
    db.add(col)
    db.commit()
    db.refresh(col)
    return col


@router.put("/{collection_id}", response_model=CollectionOut)
def update_collection(
    collection_id: int,
    payload: CollectionUpdate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    col = db.query(Collection).filter(Collection.id == collection_id).first()
    if not col:
        raise HTTPException(status_code=404, detail="Collection not found")
    data = payload.model_dump(exclude_unset=True)
    if "name" in data and "slug" not in data:
        data["slug"] = slugify(data["name"])
    for k, v in data.items():
        setattr(col, k, v)
    db.commit()
    db.refresh(col)
    return col


@router.delete("/{collection_id}", status_code=204)
def delete_collection(
    collection_id: int,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    col = db.query(Collection).filter(Collection.id == collection_id).first()
    if not col:
        raise HTTPException(status_code=404, detail="Collection not found")
    db.delete(col)
    db.commit()
