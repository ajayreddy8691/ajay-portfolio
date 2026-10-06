from fastapi import APIRouter, BackgroundTasks, Depends, Response
from sqlalchemy.orm import Session

from app.core.security import require_admin
from app.db.session import get_db
from app.schemas.contact import ContactRequest, MessageOut, SeenBody
from app.services import contact_service, notification_service

router = APIRouter(tags=["contact"])


@router.post("/contact", status_code=201)
def submit(req: ContactRequest, background: BackgroundTasks, db: Session = Depends(get_db)) -> dict:
    """Public: store a message, then email the owner in the background."""
    msg = contact_service.create_message(db, req)
    background.add_task(notification_service.notify_new_message, notification_service.snapshot(msg))
    return {"id": msg.id}


# ---- Owner only (X-Admin-Key) ----

@router.get("/messages", response_model=list[MessageOut], dependencies=[Depends(require_admin)])
def inbox(db: Session = Depends(get_db)):
    return contact_service.list_messages(db)


@router.put("/messages/{message_id}/seen", status_code=204, dependencies=[Depends(require_admin)])
def set_seen(message_id: int, body: SeenBody, db: Session = Depends(get_db)) -> Response:
    contact_service.set_seen(db, message_id, body.seen)
    return Response(status_code=204)


@router.post("/messages/seen-all", dependencies=[Depends(require_admin)])
def seen_all(db: Session = Depends(get_db)) -> dict:
    return {"updated": contact_service.mark_all_seen(db)}


@router.delete("/messages/{message_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_message(message_id: int, db: Session = Depends(get_db)) -> Response:
    contact_service.delete_message(db, message_id)
    return Response(status_code=204)
