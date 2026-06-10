from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import case, asc, desc
from typing import List, Optional
from ..core.database import get_db
from ..core.security import get_current_admin
from ..core.utils import save_upload, delete_upload
from ..models.product import Product, ProductImage
from ..models.collection import Collection
from ..models.user import AdminUser
from ..schemas.product import ProductCreate, ProductUpdate, ProductOut, ProductImageOut

router = APIRouter(prefix="/products", tags=["Products"])

# ── helpers ───────────────────────────────────────────────────────────────────

def _sync_sold_out(product: Product):
    """Auto-set is_sold_out based on quantity."""
    product.is_sold_out = product.quantity <= 0


def _load_product(db: Session, product_id: int) -> Product:
    product = (
        db.query(Product)
        .options(
            joinedload(Product.category),
            joinedload(Product.brand),
            joinedload(Product.collection),
            joinedload(Product.images),
        )
        .filter(Product.id == product_id)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# ── public listing ────────────────────────────────────────────────────────────

@router.get("", response_model=List[ProductOut])
def list_products(
    db: Session = Depends(get_db),
    category_id: Optional[int] = Query(None),
    brand_id: Optional[int] = Query(None),
    collection_id: Optional[int] = Query(None),
    on_sale: Optional[bool] = Query(None),
    new: Optional[bool] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    search: Optional[str] = Query(None),
    sort: Optional[str] = Query(None, description="price_asc | price_desc | newest"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    include_inactive: bool = Query(False),
):
    q = (
        db.query(Product)
        .options(
            joinedload(Product.category),
            joinedload(Product.brand),
            joinedload(Product.collection),
            joinedload(Product.images),
        )
    )

    if not include_inactive:
        q = q.filter(Product.is_active == True)

    if category_id is not None:
        q = q.filter(Product.category_id == category_id)
    if brand_id is not None:
        q = q.filter(Product.brand_id == brand_id)
    if collection_id is not None:
        q = q.filter(Product.collection_id == collection_id)
    if on_sale:
        q = q.filter(Product.discount_percent != None, Product.discount_percent > 0)
    if new:
        q = q.join(Collection, Product.collection_id == Collection.id).filter(Collection.is_new == True)
    if search:
        q = q.filter(Product.name.ilike(f"%{search}%"))
    if min_price is not None:
        q = q.filter(Product.price >= min_price)
    if max_price is not None:
        q = q.filter(Product.price <= max_price)

    # Sort — use SQL CASE to sort by final price
    final_price_expr = case(
        (Product.discount_percent.is_not(None), Product.price * (1 - Product.discount_percent / 100)),
        else_=Product.price,
    )
    if sort == "price_asc":
        q = q.order_by(asc(final_price_expr))
    elif sort == "price_desc":
        q = q.order_by(desc(final_price_expr))
    else:
        q = q.order_by(desc(Product.id))  # newest by default

    return q.offset(skip).limit(limit).all()


# ── single product ────────────────────────────────────────────────────────────

@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    return _load_product(db, product_id)


# ── admin CRUD ────────────────────────────────────────────────────────────────

@router.post("", response_model=ProductOut, status_code=201)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    product = Product(**payload.model_dump())
    _sync_sold_out(product)
    db.add(product)
    db.commit()
    db.refresh(product)
    return _load_product(db, product.id)


@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(product, k, v)
    _sync_sold_out(product)
    db.commit()
    return _load_product(db, product.id)


@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for img in product.images:
        delete_upload(img.image_url)
    db.delete(product)
    db.commit()


# ── product images ────────────────────────────────────────────────────────────

@router.post("/{product_id}/images", response_model=List[ProductImageOut], status_code=201)
async def upload_product_images(
    product_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    has_primary = db.query(ProductImage).filter(
        ProductImage.product_id == product_id,
        ProductImage.is_primary == True,
    ).first() is not None

    new_images = []
    for i, file in enumerate(files):
        url = await save_upload(file, prefix=f"prod_{product_id}")
        is_primary = not has_primary and i == 0
        img = ProductImage(product_id=product_id, image_url=url, is_primary=is_primary)
        db.add(img)
        new_images.append(img)
        if is_primary:
            has_primary = True

    db.commit()
    for img in new_images:
        db.refresh(img)
    return new_images


@router.patch("/{product_id}/images/{image_id}/primary", response_model=ProductImageOut)
def set_primary_image(
    product_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    # Clear existing primary
    db.query(ProductImage).filter(
        ProductImage.product_id == product_id,
        ProductImage.is_primary == True,
    ).update({"is_primary": False})

    img = db.query(ProductImage).filter(
        ProductImage.id == image_id,
        ProductImage.product_id == product_id,
    ).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")
    img.is_primary = True
    db.commit()
    db.refresh(img)
    return img


@router.delete("/{product_id}/images/{image_id}", status_code=204)
def delete_product_image(
    product_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    img = db.query(ProductImage).filter(
        ProductImage.id == image_id,
        ProductImage.product_id == product_id,
    ).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")
    delete_upload(img.image_url)

    was_primary = img.is_primary
    db.delete(img)
    db.commit()

    # If deleted image was primary, promote the next one
    if was_primary:
        next_img = db.query(ProductImage).filter(
            ProductImage.product_id == product_id
        ).first()
        if next_img:
            next_img.is_primary = True
            db.commit()
