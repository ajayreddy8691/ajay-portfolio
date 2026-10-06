from sqlalchemy import BigInteger, String, Text
from sqlalchemy.dialects import mysql
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class ContentDoc(Base):
    """One JSON document (a skill box, education, experience, project or achievement). Key: "<collection>:<id>"."""

    __tablename__ = "content_docs"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    collection: Mapped[str] = mapped_column(String(32), index=True)
    seq: Mapped[int] = mapped_column(BigInteger, index=True)  # keeps insertion order stable across edits
    payload: Mapped[str] = mapped_column(Text().with_variant(mysql.LONGTEXT(), "mysql"))
