from datetime import datetime, timezone

from pydantic import BaseModel, ConfigDict, Field, field_serializer, field_validator


class ContactRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=100)
    email: str = Field(max_length=255, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    subject: str | None = Field(default=None, max_length=150)
    message: str = Field(min_length=1, max_length=3000)

    @field_validator("subject")
    @classmethod
    def _blank_subject(cls, v: str | None) -> str | None:
        return v or None


class MessageOut(BaseModel):
    """Matches what the React inbox expects: id, name, email, subject, message, createdAt, seen."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    subject: str | None = None
    message: str
    created_at: datetime = Field(serialization_alias="createdAt")
    seen: bool

    @field_serializer("created_at")
    def _utc_iso(self, v: datetime) -> str:
        v = v.replace(tzinfo=timezone.utc) if v.tzinfo is None else v.astimezone(timezone.utc)
        return v.isoformat().replace("+00:00", "Z")


class SeenBody(BaseModel):
    seen: bool
