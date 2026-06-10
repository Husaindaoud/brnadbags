# Women's Fashion Boutique — Full-Stack E-Commerce Catalog

A modern women's fashion store where customers **browse products and send inquiries via WhatsApp**. No online payments. Includes a full admin dashboard for managing products, categories, brands, collections, slider images, and announcements.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React + Vite, Tailwind CSS v4, React Router, Axios, Framer Motion, Swiper.js, React Icons, React Hot Toast |
| **Backend** | FastAPI, SQLAlchemy ORM, SQLite (dev), Pydantic v2, python-jose (JWT), passlib/bcrypt |

---

## Prerequisites

- **Python** 3.10 or higher
- **Node.js** 18 or higher
- `pip` and `npm` available in your terminal

---

## Quick Start

### 1. Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment (copy and edit)
cp .env.example .env
# Edit .env to set your SECRET_KEY, admin credentials, WhatsApp number, etc.

# Seed sample data (categories, brands, products, slider images, announcement)
python seed.py

# Start the API server
uvicorn app.main:app --reload --port 8000
```

API runs at **http://localhost:8000**  
Swagger docs at **http://localhost:8000/docs**

---

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
# Create .env (already included with defaults):
# VITE_API_URL=http://localhost:8000

# Start the dev server
npm run dev
```

App runs at **http://localhost:5173**

---

## Default Admin Credentials

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `admin123` |
| Admin URL | `http://localhost:5173/admin/login` |

> Change these in `backend/.env` before deploying.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | SQLAlchemy connection string | `sqlite:///./app/fashion_store.db` |
| `SECRET_KEY` | JWT signing secret — **change in production** | `super-secret-...` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime in minutes | `1440` (24h) |
| `ADMIN_USERNAME` | Seeded admin username | `admin` |
| `ADMIN_PASSWORD` | Seeded admin password | `admin123` |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend base URL | `http://localhost:8000` |

---

## Seed Script

The seed script creates sample data so the store isn't empty on first run:

- 5 categories (Shoes, Clothes, Wallets, Bags, Accessories)
- 3 brands (Zara, H&M, Luxe Studio)
- 2 collections (Summer 2024 — new, Classic Essentials)
- 12 products with descriptions, prices, and discount examples
- 3 homepage slider images
- 1 active announcement banner

```bash
cd backend
python seed.py
```

The script is **idempotent** — safe to run multiple times.

---

## Project Structure

```
business/
├── backend/
│   ├── app/
│   │   ├── core/           config, database, security, utils
│   │   ├── models/         SQLAlchemy ORM models
│   │   ├── schemas/        Pydantic request/response schemas
│   │   ├── routers/        FastAPI route handlers
│   │   ├── uploads/        Uploaded images (served statically)
│   │   └── main.py         App entry point, CORS, startup seed
│   ├── seed.py             Sample data seed script
│   ├── requirements.txt
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── components/     Shared UI components
    │   │   └── admin/      Admin-specific components
    │   ├── context/        CartContext, SettingsContext, AuthContext
    │   ├── pages/          Public pages
    │   │   └── admin/      Admin dashboard pages
    │   ├── services/       Axios API client + helpers
    │   └── assets/
    ├── .env
    └── vite.config.js
```

---

## Key Features

### Public Store
- **Homepage** — animated hero slider, category grid, new arrivals, sale sections
- **Product listing** — filters by category/brand/collection/price/sale/new, sort by price
- **Product detail** — image gallery, quantity display, sold-out status
- **Inquiry Cart** — add items, adjust quantities, click **"Send to WhatsApp"** to open a pre-filled WhatsApp message
- **Announcement banner** — dismissible promo/new-collection banner from admin
- **Floating WhatsApp button** — always visible on every page
- **Instagram link** — in navbar and footer

### Admin Dashboard (`/admin`)
- **Login** protected by JWT
- **Site Settings** — upload logo, set WhatsApp number, Instagram URL
- **Categories** — add/edit/delete with images
- **Brands** — add/edit/delete with logos
- **Collections** — add/edit/delete, mark as "New"
- **Products** — full CRUD, multi-image upload, set primary image, live discount/final-price preview
- **Slider Images** — upload, caption, link, reorder
- **Announcements** — create, toggle active/inactive, delete

---

## API Endpoints (summary)

| Endpoint | Access | Description |
|---|---|---|
| `POST /auth/login` | Public | Returns JWT token |
| `GET /settings` | Public | Site logo, WhatsApp, Instagram |
| `PUT /settings` | Admin | Update settings |
| `POST /settings/logo` | Admin | Upload logo |
| `GET /categories` | Public | All categories |
| `GET /brands` | Public | All brands |
| `GET /collections` | Public | All collections |
| `GET /products` | Public | Products with filters |
| `GET /products/{id}` | Public | Single product with images |
| `GET /sliders` | Public | Slider images in order |
| `GET /announcements/active` | Public | Active announcement banners |
| All `POST/PUT/DELETE` | Admin | Require `Authorization: Bearer <token>` |

Full interactive docs: **http://localhost:8000/docs**

---

## Switching to PostgreSQL

1. Install `psycopg2-binary`
2. Update `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL=postgresql://user:password@localhost/fashion_store
   ```
3. Remove `connect_args` in `database.py` is already guarded by an `if "sqlite"` check — no other changes needed.

---

## Production Notes

- Set a strong `SECRET_KEY` (32+ random bytes)
- Change `ADMIN_PASSWORD` immediately
- Replace the SQLite DB with PostgreSQL
- Serve uploaded images from a CDN/cloud storage bucket (replace `save_upload` in `core/utils.py`)
- Build the frontend: `npm run build` → serve the `dist/` folder behind a web server
