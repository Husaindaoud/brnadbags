import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import inspect, text

from .core.database import engine, Base, SessionLocal
from .core.config import get_settings
from .core.security import hash_password
from .models import AdminUser, SiteSettings  # noqa: F401 — ensures tables are created
from .models import Category, Brand, Collection, Product, ProductImage  # noqa: F401
from .models import SliderImage, Announcement  # noqa: F401
from .models import Order, OrderItem  # noqa: F401
from .models import PromoCode  # noqa: F401
from .routers import auth, site_settings, categories, brands, collections, products, sliders, announcements
from .routers import orders, promo_codes

settings = get_settings()

# ── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Fashion Store API",
    description="Backend for the women's fashion e-commerce catalog",
    version="1.0.0",
)

# ── CORS ─────────────────────────────────────────────────────────────────────
_extra = [u.strip() for u in settings.frontend_url.split(",") if u.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        *_extra,
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_origin_regex=r"https://(brnadbags.*\.vercel\.app|brandbagsandmore\.com|www\.brandbagsandmore\.com)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static uploads ────────────────────────────────────────────────────────────
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(site_settings.router)
app.include_router(categories.router)
app.include_router(brands.router)
app.include_router(collections.router)
app.include_router(products.router)
app.include_router(sliders.router)
app.include_router(announcements.router)
app.include_router(orders.router)
app.include_router(promo_codes.router)


# ── Startup: create tables + seed admin ──────────────────────────────────────
@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    _migrate(engine)
    _seed(SessionLocal())


def _migrate(engine):
    """Add any columns that exist in models but are missing from existing tables."""
    inspector = inspect(engine)
    with engine.connect() as conn:
        # site_settings: favicon_url (added after initial release)
        existing = {c["name"] for c in inspector.get_columns("site_settings")}
        if "favicon_url" not in existing:
            conn.execute(text("ALTER TABLE site_settings ADD COLUMN favicon_url VARCHAR"))
            conn.commit()

        ann_cols = {c["name"] for c in inspector.get_columns("announcements")}
        if "bg_color" not in ann_cols:
            conn.execute(text("ALTER TABLE announcements ADD COLUMN bg_color VARCHAR DEFAULT '#6B7C45'"))
            conn.commit()

        ss_cols = {c["name"] for c in inspector.get_columns("site_settings")}
        if "footer_description" not in ss_cols:
            conn.execute(text("ALTER TABLE site_settings ADD COLUMN footer_description VARCHAR"))
            conn.commit()
        if "notification_emails" not in ss_cols:
            conn.execute(text("ALTER TABLE site_settings ADD COLUMN notification_emails VARCHAR"))
            conn.commit()
        if "site_title" not in ss_cols:
            conn.execute(text("ALTER TABLE site_settings ADD COLUMN site_title VARCHAR"))
            conn.commit()

        # orders: promo code columns
        order_cols = {c["name"] for c in inspector.get_columns("orders")}
        if "promo_code" not in order_cols:
            conn.execute(text("ALTER TABLE orders ADD COLUMN promo_code VARCHAR"))
            conn.commit()
        if "discount_amount" not in order_cols:
            conn.execute(text("ALTER TABLE orders ADD COLUMN discount_amount FLOAT DEFAULT 0"))
            conn.commit()


def _seed(db: Session):
    try:
        # Seed admin user
        existing = db.query(AdminUser).filter(AdminUser.username == settings.admin_username).first()
        if not existing:
            admin = AdminUser(
                username=settings.admin_username,
                hashed_password=hash_password(settings.admin_password),
            )
            db.add(admin)
            db.commit()
            print(f"[seed] Admin user '{settings.admin_username}' created.")

        # Seed default site settings row
        if not db.query(SiteSettings).first():
            db.add(SiteSettings(id=1, whatsapp_number="", instagram_url=""))
            db.commit()
            print("[seed] SiteSettings row created.")
    finally:
        db.close()


# ── Health check ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Fashion Store API is running"}
