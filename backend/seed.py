#!/usr/bin/env python3
"""
Fashion Store — Seed Script
Run from the /backend directory:  python seed.py
Creates sample categories, brands, collections, products,
slider images, and an announcement so the site is never empty.
"""
import os
import sys
import uuid

sys.path.insert(0, os.path.dirname(__file__))

from PIL import Image, ImageDraw
from app.core.database import engine, SessionLocal, Base
from app.core.security import hash_password
from app.core.config import get_settings
from app.models import (
    AdminUser, SiteSettings, Category, Brand, Collection,
    Product, ProductImage, SliderImage, Announcement,
)

settings = get_settings()
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "app", "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)


# ── image helpers ─────────────────────────────────────────────────────────────

def _gradient(w: int, h: int, top: tuple, bottom: tuple) -> Image.Image:
    img = Image.new("RGB", (w, h))
    draw = ImageDraw.Draw(img)
    for y in range(h):
        r = int(top[0] + (bottom[0] - top[0]) * y / h)
        g = int(top[1] + (bottom[1] - top[1]) * y / h)
        b = int(top[2] + (bottom[2] - top[2]) * y / h)
        draw.line([(0, y), (w, y)], fill=(r, g, b))
    return img


def _solid(w: int, h: int, color: tuple) -> Image.Image:
    return Image.new("RGB", (w, h), color)


def _save(img: Image.Image, prefix: str) -> str:
    filename = f"{prefix}_{uuid.uuid4().hex[:8]}.jpg"
    img.save(os.path.join(UPLOADS_DIR, filename), "JPEG", quality=88)
    return f"/uploads/{filename}"


# ── seed data ─────────────────────────────────────────────────────────────────

CATEGORIES = [
    ("Shoes",        "shoes",        (245, 210, 210), (210, 160, 165)),
    ("Clothes",      "clothes",      (210, 225, 245), (160, 185, 230)),
    ("Wallets",      "wallets",      (245, 235, 210), (225, 205, 165)),
    ("Bags",         "bags",         (210, 240, 220), (165, 215, 185)),
    ("Accessories",  "accessories",  (235, 210, 245), (200, 165, 235)),
]

BRANDS = [
    ("Zara",        (210,  60,  90)),
    ("H&M",         ( 45, 155, 100)),
    ("Luxe Studio", (160, 130,  80)),
]

PRODUCTS = [
    # (name, description, price, discount%, qty, category_slug, brand_name, collection_slug)
    ("Rose Gold Block Heels",
     "Elegant rose gold block heels with a cushioned insole. Perfect for evenings out.",
     89.99, 20, 12, "shoes", "Zara", "summer-2024"),

    ("Strappy Leather Sandals",
     "Premium leather strappy sandals with adjustable ankle strap.",
     74.99, None, 8, "shoes", "Luxe Studio", "summer-2024"),

    ("White Linen Blouse",
     "Breathable linen blouse with relaxed fit. Machine washable.",
     49.99, 15, 20, "clothes", "H&M", "summer-2024"),

    ("Floral Midi Dress",
     "Romantic floral print midi dress with adjustable tie waist.",
     85.00, None, 15, "clothes", "Zara", "summer-2024"),

    ("Wide-Leg Linen Trousers",
     "Relaxed wide-leg trousers in lightweight linen. Available in beige and white.",
     65.00, 10, 18, "clothes", "H&M", "classic-essentials"),

    ("Mini Quilted Crossbody Bag",
     "Compact quilted crossbody with gold chain strap. Fits all essentials.",
     120.00, 25, 6, "bags", "Luxe Studio", "classic-essentials"),

    ("Canvas Tote Bag",
     "Sturdy canvas tote with interior zip pocket. Perfect for daily use.",
     39.99, None, 30, "bags", "H&M", None),

    ("Slim Card Wallet",
     "Italian leather slim wallet with 6 card slots and a bill compartment.",
     55.00, None, 14, "wallets", "Luxe Studio", "classic-essentials"),

    ("Zip-Around Leather Wallet",
     "Full-grain leather zip wallet with coin pouch and multiple compartments.",
     72.00, 15, 9, "wallets", "Zara", None),

    ("Gold Hoop Earrings",
     "Classic 18k gold-plated hoop earrings. Hypoallergenic and lightweight.",
     28.00, None, 25, "accessories", "Zara", "summer-2024"),

    ("Silk Scrunchie Set",
     "Set of 3 silk scrunchies in rose, ivory, and sand. Gentle on hair.",
     18.00, None, 40, "accessories", "H&M", "summer-2024"),

    ("Pointed-Toe Kitten Heels",
     "Timeless pointed-toe kitten heels in nude suede. Heel height 4cm.",
     95.00, None, 0, "shoes", "Luxe Studio", "classic-essentials"),
]

SLIDER_IMAGES = [
    ("Summer Arrivals", "/new-collection", (240, 200, 200), (210, 155, 165)),
    ("Up to 25% Off",   "/sale",           (200, 220, 240), (155, 180, 220)),
    ("New Collections", "/new-collection", (220, 240, 215), (165, 215, 180)),
]


# ── main ──────────────────────────────────────────────────────────────────────

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        _run(db)
    finally:
        db.close()


def _run(db):
    # Admin user
    if not db.query(AdminUser).filter(AdminUser.username == settings.admin_username).first():
        db.add(AdminUser(
            username=settings.admin_username,
            hashed_password=hash_password(settings.admin_password),
        ))
        db.commit()
        print(f"  [OK] Admin '{settings.admin_username}' created")
    else:
        print(f"  -- Admin '{settings.admin_username}' already exists")

    # Site settings
    if not db.query(SiteSettings).first():
        db.add(SiteSettings(
            id=1,
            whatsapp_number="+1234567890",
            instagram_url="https://instagram.com/boutique",
        ))
        db.commit()
        print("  [OK] Site settings created")

    # Categories
    if db.query(Category).count() == 0:
        for name, slug, top, bot in CATEGORIES:
            img = _gradient(600, 600, top, bot)
            cat = Category(name=name, slug=slug, image_url=_save(img, f"cat_{slug}"))
            db.add(cat)
        db.commit()
        print(f"  [OK] {len(CATEGORIES)} categories created")
    else:
        print(f"  -- Categories already seeded")

    # Brands
    if db.query(Brand).count() == 0:
        for name, color in BRANDS:
            img = _gradient(300, 300, color, tuple(max(0, c - 40) for c in color))
            slug = name.lower().replace("&", "n").replace(" ", "_")
            brand = Brand(name=name, logo_url=_save(img, f"brand_{slug}"))
            db.add(brand)
        db.commit()
        print(f"  [OK] {len(BRANDS)} brands created")
    else:
        print(f"  -- Brands already seeded")

    # Collections
    if db.query(Collection).count() == 0:
        db.add(Collection(name="Summer 2024", slug="summer-2024", is_new=True))
        db.add(Collection(name="Classic Essentials", slug="classic-essentials", is_new=False))
        db.commit()
        print("  [OK] 2 collections created")
    else:
        print("  -- Collections already seeded")

    # Products
    if db.query(Product).count() == 0:
        cat_map   = {c.slug: c for c in db.query(Category).all()}
        brand_map = {b.name: b for b in db.query(Brand).all()}
        coll_map  = {c.slug: c for c in db.query(Collection).all()}

        # palette: different gradient per product
        palettes = [
            ((245,215,215),(220,170,175)),
            ((215,225,245),(175,190,230)),
            ((245,240,215),(225,210,170)),
            ((215,240,225),(170,215,190)),
            ((235,215,245),(200,170,235)),
            ((245,220,200),(225,185,155)),
        ]
        for i, (name, desc, price, disc, qty, cat_slug, brand_name, coll_slug) in enumerate(PRODUCTS):
            top, bot = palettes[i % len(palettes)]
            img_url  = _save(_gradient(600, 800, top, bot), f"prod_{i+1}")

            product = Product(
                name=name,
                description=desc,
                price=price,
                discount_percent=disc,
                quantity=qty,
                is_sold_out=(qty == 0),
                is_active=True,
                category_id=cat_map[cat_slug].id if cat_slug in cat_map else None,
                brand_id=brand_map[brand_name].id if brand_name in brand_map else None,
                collection_id=coll_map[coll_slug].id if coll_slug and coll_slug in coll_map else None,
            )
            db.add(product)
            db.flush()

            db.add(ProductImage(product_id=product.id, image_url=img_url, is_primary=True))
            # Second image variant (slightly different gradient)
            img2_url = _save(_gradient(600, 800, bot, top), f"prod_{i+1}b")
            db.add(ProductImage(product_id=product.id, image_url=img2_url, is_primary=False))

        db.commit()
        print(f"  [OK] {len(PRODUCTS)} products created")
    else:
        print("  -- Products already seeded")

    # Slider images
    if db.query(SliderImage).count() == 0:
        for order, (caption, link, top, bot) in enumerate(SLIDER_IMAGES):
            img = _gradient(1200, 500, top, bot)
            db.add(SliderImage(
                image_url=_save(img, f"slide_{order+1}"),
                caption=caption,
                link=link,
                order=order,
            ))
        db.commit()
        print(f"  [OK] {len(SLIDER_IMAGES)} slider images created")
    else:
        print("  -- Slider images already seeded")

    # Announcement
    if db.query(Announcement).count() == 0:
        db.add(Announcement(
            title="Summer Sale is Live!",
            message="Up to 25% off on selected styles. Shop now while stocks last.",
            type="discount",
            is_active=True,
        ))
        db.commit()
        print("  [OK] Announcement created")
    else:
        print("  -- Announcements already seeded")

    print("\nSeed complete! Start the server and open http://localhost:5173")


if __name__ == "__main__":
    print("Seeding Fashion Store database…\n")
    seed()
