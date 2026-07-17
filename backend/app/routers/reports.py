from datetime import datetime, date
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..core.database import get_db
from ..core.security import get_current_admin
from ..models.user import AdminUser
from ..models.order import Order, OrderItem

router = APIRouter(prefix="/reports", tags=["Reports"])


def _bounds(start: Optional[str], end: Optional[str]):
    today = date.today()
    s = datetime.strptime(start, "%Y-%m-%d") if start else datetime(today.year, today.month, 1)
    e = datetime.strptime(end, "%Y-%m-%d").replace(hour=23, minute=59, second=59) if end else datetime.combine(today, datetime.max.time())
    return s, e


# ── 1. Orders export ─────────────────────────────────────────────────────────
@router.get("/orders")
def report_orders(
    start: Optional[str] = Query(None),
    end:   Optional[str] = Query(None),
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    s, e = _bounds(start, end)
    orders = (
        db.query(Order)
        .filter(Order.created_at >= s, Order.created_at <= e)
        .order_by(Order.created_at.desc())
        .all()
    )
    rows = []
    for o in orders:
        items_str = "; ".join(f"{i.product_name} x{i.quantity}" for i in o.items)
        rows.append({
            "order_ref":   o.order_ref,
            "date":        o.created_at.strftime("%Y-%m-%d %H:%M"),
            "customer":    f"{o.first_name} {o.last_name}",
            "phone":       o.phone,
            "email":       o.email or "",
            "city":        o.city,
            "country":     o.country,
            "status":      o.status,
            "items":       items_str,
            "subtotal":    round(o.subtotal, 2),
            "discount":    round(o.discount_amount or 0, 2),
            "promo_code":  o.promo_code or "",
            "total":       round(o.total, 2),
        })
    return {"rows": rows, "count": len(rows)}


# ── 2. Revenue by day ────────────────────────────────────────────────────────
@router.get("/revenue")
def report_revenue(
    start: Optional[str] = Query(None),
    end:   Optional[str] = Query(None),
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    s, e = _bounds(start, end)
    day_col = func.date(Order.created_at)
    rows_raw = (
        db.query(
            day_col.label("day"),
            func.count(Order.id).label("orders"),
            func.sum(Order.subtotal).label("gross"),
            func.sum(Order.discount_amount).label("discounts"),
            func.sum(Order.total).label("net"),
        )
        .filter(Order.created_at >= s, Order.created_at <= e)
        .filter(Order.status != "cancelled")
        .group_by(day_col)
        .order_by(day_col)
        .all()
    )

    totals = {"orders": 0, "gross": 0.0, "discounts": 0.0, "net": 0.0}
    rows = []
    for r in rows_raw:
        rows.append({
            "date":      str(r.day),
            "orders":    r.orders,
            "gross":     round(float(r.gross or 0), 2),
            "discounts": round(float(r.discounts or 0), 2),
            "net":       round(float(r.net or 0), 2),
        })
        totals["orders"]    += r.orders
        totals["gross"]     += float(r.gross or 0)
        totals["discounts"] += float(r.discounts or 0)
        totals["net"]       += float(r.net or 0)

    totals = {k: round(v, 2) if isinstance(v, float) else v for k, v in totals.items()}
    return {"rows": rows, "totals": totals}


# ── 3. Top products ──────────────────────────────────────────────────────────
@router.get("/products")
def report_products(
    start: Optional[str] = Query(None),
    end:   Optional[str] = Query(None),
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    s, e = _bounds(start, end)
    rows_raw = (
        db.query(
            OrderItem.product_name,
            func.sum(OrderItem.quantity).label("units_sold"),
            func.sum(OrderItem.price * OrderItem.quantity).label("revenue"),
        )
        .join(Order, Order.id == OrderItem.order_id)
        .filter(Order.created_at >= s, Order.created_at <= e)
        .filter(Order.status != "cancelled")
        .group_by(OrderItem.product_name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(50)
        .all()
    )
    rows = [
        {
            "product":    r.product_name,
            "units_sold": int(r.units_sold or 0),
            "revenue":    round(float(r.revenue or 0), 2),
        }
        for r in rows_raw
    ]
    return {"rows": rows}


# ── 4. Orders by status ──────────────────────────────────────────────────────
@router.get("/status")
def report_status(
    start: Optional[str] = Query(None),
    end:   Optional[str] = Query(None),
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    s, e = _bounds(start, end)
    rows_raw = (
        db.query(
            Order.status,
            func.count(Order.id).label("count"),
            func.sum(Order.total).label("total"),
        )
        .filter(Order.created_at >= s, Order.created_at <= e)
        .group_by(Order.status)
        .all()
    )
    STATUS_ORDER = ["pending", "confirmed", "shipped", "delivered", "cancelled"]
    rows = sorted(
        [
            {
                "status": r.status,
                "count":  r.count,
                "total":  round(float(r.total or 0), 2),
            }
            for r in rows_raw
        ],
        key=lambda x: STATUS_ORDER.index(x["status"]) if x["status"] in STATUS_ORDER else 99,
    )
    grand_total = round(sum(r["total"] for r in rows), 2)
    return {"rows": rows, "grand_total": grand_total}
