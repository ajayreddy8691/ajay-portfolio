import hmac

from fastapi import Header, HTTPException, status

from app.core.config import get_settings


def require_admin(x_admin_key: str | None = Header(default=None)) -> None:
    """Dependency for owner-only routes: the X-Admin-Key header must match ADMIN_KEY (constant-time compare)."""
    expected = get_settings().admin_key.encode("utf-8")
    if not x_admin_key or not hmac.compare_digest(x_admin_key.encode("utf-8"), expected):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing admin key")
