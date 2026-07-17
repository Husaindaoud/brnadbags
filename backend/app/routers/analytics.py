import os
import requests as http
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from ..models.user import AdminUser
from ..core.security import get_current_admin

router = APIRouter(prefix="/analytics", tags=["Analytics"])

UMAMI_URL      = os.getenv("UMAMI_URL",        "https://umami-staging-1a19.up.railway.app")
UMAMI_USERNAME = os.getenv("UMAMI_USERNAME",    "admin")
UMAMI_PASSWORD = os.getenv("UMAMI_PASSWORD",    "umami")
WEBSITE_ID     = os.getenv("UMAMI_WEBSITE_ID",  "87d4adf3-6ee7-4a71-a9fe-95a236360017")

_cache = {"token": None, "expires": None}


def _token() -> str:
    now = datetime.now(timezone.utc)
    if _cache["token"] and _cache["expires"] and now < _cache["expires"]:
        return _cache["token"]
    resp = http.post(
        f"{UMAMI_URL}/api/auth/login",
        json={"username": UMAMI_USERNAME, "password": UMAMI_PASSWORD},
        timeout=10,
    )
    if resp.status_code != 200:
        raise HTTPException(status_code=503, detail="Cannot connect to analytics service")
    _cache["token"] = resp.json()["token"]
    _cache["expires"] = now + timedelta(hours=1)
    return _cache["token"]


def _get(path: str, params: dict = None):
    token = _token()
    resp = http.get(
        f"{UMAMI_URL}{path}",
        headers={"Authorization": f"Bearer {token}"},
        params=params,
        timeout=10,
    )
    if resp.status_code == 401:
        _cache["token"] = None
        resp = http.get(
            f"{UMAMI_URL}{path}",
            headers={"Authorization": f"Bearer {_token()}"},
            params=params,
            timeout=10,
        )
    return resp.json()


def _ms(dt: datetime) -> int:
    return int(dt.timestamp() * 1000)


def _range(days: int):
    now = datetime.now(timezone.utc)
    start = now - timedelta(days=days)
    return {"startAt": _ms(start), "endAt": _ms(now)}


def _stat(data: dict, key: str) -> int:
    """Handle both Umami v1 {key: {value: N}} and v2 {key: N} shapes."""
    v = data.get(key, 0)
    if isinstance(v, dict):
        return v.get("value", 0)
    return int(v or 0)


def _active_count(data) -> int:
    if isinstance(data, list):
        first = data[0] if data else {}
        if isinstance(first, dict):
            return int(first.get("x", 0))
        return int(first or 0)
    if isinstance(data, dict):
        return int(data.get("x", data.get("visitors", 0)))
    return 0


@router.get("/summary")
def get_summary(_: AdminUser = Depends(get_current_admin)):
    try:
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        now = datetime.now(timezone.utc)

        today   = _get(f"/api/websites/{WEBSITE_ID}/stats",
                       {"startAt": _ms(today_start), "endAt": _ms(now)})
        week    = _get(f"/api/websites/{WEBSITE_ID}/stats", _range(7))
        month   = _get(f"/api/websites/{WEBSITE_ID}/stats", _range(30))
        active  = _get(f"/api/websites/{WEBSITE_ID}/active")

        return {
            "today": {
                "visitors":  _stat(today, "visitors"),
                "pageviews": _stat(today, "pageviews"),
                "visits":    _stat(today, "visits"),
            },
            "week": {
                "visitors":  _stat(week, "visitors"),
                "pageviews": _stat(week, "pageviews"),
            },
            "month": {
                "visitors":  _stat(month, "visitors"),
                "pageviews": _stat(month, "pageviews"),
            },
            "active": _active_count(active),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.get("/pageviews")
def get_pageviews(_: AdminUser = Depends(get_current_admin)):
    try:
        params = {**_range(30), "unit": "day", "timezone": "UTC"}
        data = _get(f"/api/websites/{WEBSITE_ID}/pageviews", params)
        # Normalise: some versions return {"pageviews": [...], "sessions": [...]}
        # others return a bare list
        if isinstance(data, dict):
            return {"pageviews": data.get("pageviews", []), "sessions": data.get("sessions", [])}
        return {"pageviews": data if isinstance(data, list) else [], "sessions": []}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.get("/pages")
def get_top_pages(_: AdminUser = Depends(get_current_admin)):
    try:
        params = {**_range(30), "type": "url", "limit": 8}
        data = _get(f"/api/websites/{WEBSITE_ID}/metrics", params)
        return data if isinstance(data, list) else []
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.get("/referrers")
def get_referrers(_: AdminUser = Depends(get_current_admin)):
    try:
        params = {**_range(30), "type": "referrer", "limit": 6}
        data = _get(f"/api/websites/{WEBSITE_ID}/metrics", params)
        return data if isinstance(data, list) else []
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.get("/devices")
def get_devices(_: AdminUser = Depends(get_current_admin)):
    try:
        params = {**_range(30), "type": "device", "limit": 6}
        data = _get(f"/api/websites/{WEBSITE_ID}/metrics", params)
        return data if isinstance(data, list) else []
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))
