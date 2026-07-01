from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..core.database import get_db
from ..core.security import get_current_admin
from ..models.promo_code import PromoCode
from ..schemas.promo_code import PromoCodeCreate, PromoCodeUpdate, PromoCodeOut, PromoValidateResponse

router = APIRouter(tags=['Promo Codes'])


def check_code_usable(pc: PromoCode) -> tuple[bool, str]:
    if not pc.is_active:
        return False, 'Promo code is not active.'
    if pc.expires_at and pc.expires_at < datetime.utcnow():
        return False, 'Promo code has expired.'
    if pc.max_uses is not None and pc.uses_count >= pc.max_uses:
        return False, 'Promo code has reached its usage limit.'
    return True, 'Valid'


@router.get('/promo/validate', response_model=PromoValidateResponse)
def validate_promo(code: str, db: Session = Depends(get_db)):
    pc = db.query(PromoCode).filter(PromoCode.code == code.strip().upper()).first()
    if not pc:
        return PromoValidateResponse(valid=False, message='Promo code not found.')
    valid, msg = check_code_usable(pc)
    if not valid:
        return PromoValidateResponse(valid=False, message=msg)
    return PromoValidateResponse(
        valid=True,
        discount_percent=pc.discount_percent,
        message=f'{pc.discount_percent:.0f}% discount applied!',
    )


@router.get('/promo-codes', response_model=List[PromoCodeOut], dependencies=[Depends(get_current_admin)])
def list_promo_codes(db: Session = Depends(get_db)):
    return db.query(PromoCode).order_by(PromoCode.created_at.desc()).all()


@router.post('/promo-codes', response_model=PromoCodeOut, status_code=201, dependencies=[Depends(get_current_admin)])
def create_promo_code(payload: PromoCodeCreate, db: Session = Depends(get_db)):
    existing = db.query(PromoCode).filter(PromoCode.code == payload.code).first()
    if existing:
        raise HTTPException(400, 'A promo code with this code already exists.')
    pc = PromoCode(**payload.model_dump())
    db.add(pc)
    db.commit()
    db.refresh(pc)
    return pc


@router.put('/promo-codes/{code_id}', response_model=PromoCodeOut, dependencies=[Depends(get_current_admin)])
def update_promo_code(code_id: int, payload: PromoCodeUpdate, db: Session = Depends(get_db)):
    pc = db.query(PromoCode).filter(PromoCode.id == code_id).first()
    if not pc:
        raise HTTPException(404, 'Promo code not found.')
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(pc, field, value)
    db.commit()
    db.refresh(pc)
    return pc


@router.delete('/promo-codes/{code_id}', status_code=204, dependencies=[Depends(get_current_admin)])
def delete_promo_code(code_id: int, db: Session = Depends(get_db)):
    pc = db.query(PromoCode).filter(PromoCode.id == code_id).first()
    if not pc:
        raise HTTPException(404, 'Promo code not found.')
    db.delete(pc)
    db.commit()
