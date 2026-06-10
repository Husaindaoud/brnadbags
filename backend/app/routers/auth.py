from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import verify_password, create_access_token, get_current_admin
from ..models.user import AdminUser
from ..schemas.auth import LoginRequest, TokenResponse, AdminUserOut

router = APIRouter(prefix="/auth", tags=["Auth"])


# @router.post("/login", response_model=TokenResponse)
# def login(payload: LoginRequest, db: Session = Depends(get_db)):
#     user = db.query(AdminUser).filter(AdminUser.username == payload.username).first()
#     if not user or not verify_password(payload.password, user.hashed_password):
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Incorrect username or password",
#         )
#     token = create_access_token({"sub": user.username})
#     return TokenResponse(access_token=token)

from sqlalchemy.exc import SQLAlchemyError


@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    # 400 - Bad Request: missing/empty credentials
    if not payload.username or not payload.username.strip() or not payload.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username and password are required",
        )

    # 500 - Internal Server Error: database failure
    try:
        user = (
            db.query(AdminUser)
            .filter(AdminUser.username == payload.username)
            .first()
        )
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred. Please try again later.",
        )

    # 401 - Unauthorized: invalid credentials
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    # 500 - Internal Server Error: token generation failure
    try:
        token = create_access_token({"sub": user.username})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not generate access token.",
        )

    # 200 - OK
    return TokenResponse(access_token=token)


@router.get("/me", response_model=AdminUserOut)
def get_me(current_user: AdminUser = Depends(get_current_admin)):
    return current_user
