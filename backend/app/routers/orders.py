from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..core.database import get_db
from ..core.security import get_current_admin
from ..core.email import send_order_notification
from ..models.order import Order, OrderItem, _gen_ref
from ..models.product import Product
from ..models.promo_code import PromoCode
from ..models.site_settings import SiteSettings
from ..schemas.order import OrderCreate, OrderOut, OrderStatusUpdate

router = APIRouter(prefix='/orders', tags=['Orders'])


def _adjust_stock(db: Session, items, delta: int):
    """delta = -qty to decrement, +qty to restore."""
    for item in items:
        if not item.product_id:
            continue
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            continue
        product.quantity = max(0, product.quantity + delta * item.quantity)
        product.is_sold_out = product.quantity <= 0


@router.post('', response_model=OrderOut, status_code=201)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    subtotal = sum(i.price * i.quantity for i in payload.items)

    # Apply promo code if provided
    discount_amount = 0.0
    applied_code = None
    used_promo_obj = None
    if payload.promo_code:
        code_str = payload.promo_code.strip().upper()
        pc = db.query(PromoCode).filter(PromoCode.code == code_str).first()
        if pc and pc.is_active:
            expired = pc.expires_at and pc.expires_at < datetime.utcnow()
            over_limit = pc.max_uses is not None and pc.uses_count >= pc.max_uses
            if not expired and not over_limit:
                discount_amount = round(subtotal * pc.discount_percent / 100, 2)
                applied_code = code_str
                used_promo_obj = pc

    order_ref = _gen_ref()
    while db.query(Order).filter(Order.order_ref == order_ref).first():
        order_ref = _gen_ref()

    order = Order(
        order_ref=order_ref,
        first_name=payload.first_name,
        last_name=payload.last_name,
        company_name=payload.company_name,
        country=payload.country,
        street_address=payload.street_address,
        apartment=payload.apartment,
        city=payload.city,
        postcode=payload.postcode,
        phone=payload.phone,
        email=payload.email,
        order_notes=payload.order_notes,
        subtotal=subtotal,
        discount_amount=discount_amount,
        promo_code=applied_code,
        total=round(subtotal - discount_amount, 2),
    )
    db.add(order)
    db.flush()

    order_items = []
    for item in payload.items:
        oi = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            product_name=item.product_name,
            product_image_url=item.product_image_url,
            price=item.price,
            quantity=item.quantity,
        )
        db.add(oi)
        order_items.append(oi)

    # Decrement stock for each item
    _adjust_stock(db, payload.items, delta=-1)

    # Increment promo code usage counter
    if used_promo_obj:
        used_promo_obj.uses_count += 1

    db.commit()
    db.refresh(order)

    site = db.query(SiteSettings).first()
    if site and site.notification_emails:
        send_order_notification(order, site.notification_emails)

    return order


@router.get('', response_model=List[OrderOut], dependencies=[Depends(get_current_admin)])
def list_orders(db: Session = Depends(get_db)):
    return db.query(Order).order_by(Order.created_at.desc()).all()


@router.get('/{order_id}', response_model=OrderOut, dependencies=[Depends(get_current_admin)])
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(404, 'Order not found')
    return order


@router.patch('/{order_id}/status', response_model=OrderOut, dependencies=[Depends(get_current_admin)])
def update_status(order_id: int, payload: OrderStatusUpdate, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(404, 'Order not found')
    valid = {'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'}
    if payload.status not in valid:
        raise HTTPException(400, f'Status must be one of: {", ".join(valid)}')

    prev_status = order.status
    new_status = payload.status

    # Restore stock when cancelling; re-deduct if un-cancelling
    if new_status == 'cancelled' and prev_status != 'cancelled':
        _adjust_stock(db, order.items, delta=+1)
    elif prev_status == 'cancelled' and new_status != 'cancelled':
        _adjust_stock(db, order.items, delta=-1)

    order.status = new_status
    db.commit()
    db.refresh(order)
    return order
