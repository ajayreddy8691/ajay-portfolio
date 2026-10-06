import json
import re
import threading
import time

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import BadRequestError, NotFoundError
from app.models import ContentDoc

COLLECTIONS = {"skills", "education", "experience", "projects", "ach"}
_ID = re.compile(r"^[A-Za-z0-9_-]{1,40}$")
MAX_PAYLOAD_BYTES = 2_000_000

_seq_lock = threading.Lock()
_last_seq = 0


def _next_seq() -> int:
    """Strictly increasing insertion order, even when the clock resolution is coarse (Windows)."""
    global _last_seq
    with _seq_lock:
        _last_seq = max(time.time_ns(), _last_seq + 1)
        return _last_seq


def _check_collection(collection: str) -> None:
    if collection not in COLLECTIONS:
        raise NotFoundError("Unknown collection")


def _check_id(item_id: str) -> None:
    if not _ID.match(item_id):
        raise BadRequestError("Invalid id")


def list_json(db: Session, collection: str) -> str:
    """The stored payloads are already validated JSON objects, so they are joined into one array string."""
    _check_collection(collection)
    rows = db.scalars(select(ContentDoc).where(ContentDoc.collection == collection).order_by(ContentDoc.seq)).all()
    return "[" + ",".join(r.payload for r in rows) + "]"


def upsert(db: Session, collection: str, item_id: str, payload: dict) -> None:
    _check_collection(collection)
    _check_id(item_id)
    text = json.dumps({**payload, "id": item_id}, ensure_ascii=False)
    if len(text.encode("utf-8")) > MAX_PAYLOAD_BYTES:
        raise BadRequestError("Payload too large (max 2 MB)")
    key = f"{collection}:{item_id}"
    doc = db.get(ContentDoc, key)
    if doc is None:
        db.add(ContentDoc(id=key, collection=collection, seq=_next_seq(), payload=text))
    else:
        doc.payload = text
    db.commit()


def delete(db: Session, collection: str, item_id: str) -> None:
    _check_collection(collection)
    _check_id(item_id)
    doc = db.get(ContentDoc, f"{collection}:{item_id}")
    if doc is not None:
        db.delete(doc)
        db.commit()
