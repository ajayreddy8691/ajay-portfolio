from fastapi import APIRouter, Depends, Response

from app.core.security import require_admin

router = APIRouter(tags=["auth"])


@router.get("/auth", status_code=204, dependencies=[Depends(require_admin)])
def check_key() -> Response:
    """204 when the X-Admin-Key header is valid (used by the owner login)."""
    return Response(status_code=204)
