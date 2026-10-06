from fastapi import APIRouter, Body, Depends, Response
from sqlalchemy.orm import Session

from app.core.security import require_admin
from app.db.session import get_db
from app.services import content_service

router = APIRouter(prefix="/content", tags=["content"])


@router.get("/{collection}")
def list_items(collection: str, db: Session = Depends(get_db)) -> Response:
    """Public: list items of skills | education | experience | projects | ach."""
    return Response(content=content_service.list_json(db, collection), media_type="application/json")


@router.put("/{collection}/{item_id}", status_code=204, dependencies=[Depends(require_admin)])
def upsert_item(collection: str, item_id: str, payload: dict = Body(...), db: Session = Depends(get_db)) -> Response:
    content_service.upsert(db, collection, item_id, payload)
    return Response(status_code=204)


@router.delete("/{collection}/{item_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_item(collection: str, item_id: str, db: Session = Depends(get_db)) -> Response:
    content_service.delete(db, collection, item_id)
    return Response(status_code=204)
