from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.core.errors import NotFoundError
from app.models import ContactMessage
from app.schemas.contact import ContactRequest


def create_message(db: Session, req: ContactRequest) -> ContactMessage:
    msg = ContactMessage(name=req.name, email=req.email, subject=req.subject, message=req.message)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


def list_messages(db: Session) -> list[ContactMessage]:
    return list(db.scalars(select(ContactMessage).order_by(ContactMessage.created_at.desc(), ContactMessage.id.desc())).all())


def _get(db: Session, message_id: int) -> ContactMessage:
    msg = db.get(ContactMessage, message_id)
    if msg is None:
        raise NotFoundError("Message not found")
    return msg


def set_seen(db: Session, message_id: int, seen: bool) -> None:
    _get(db, message_id).seen = seen
    db.commit()


def mark_all_seen(db: Session) -> int:
    result = db.execute(update(ContactMessage).where(ContactMessage.seen.is_(False)).values(seen=True))
    db.commit()
    return result.rowcount or 0


def delete_message(db: Session, message_id: int) -> None:
    db.delete(_get(db, message_id))
    db.commit()
