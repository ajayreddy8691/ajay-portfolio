from functools import lru_cache

from pydantic import Field, ValidationError, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """All configuration comes from environment variables (or a local .env file)."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "ajay-portfolio-api"
    database_url: str = "sqlite:///./data/portfolio.db"
    admin_key: str = Field(min_length=8)  # required: owner key for every write and the inbox
    cors_origins: str = "http://localhost:5173"
    resend_api_key: str = ""
    notify_email: str = ""
    notify_from: str = "Portfolio <onboarding@resend.dev>"
    site_url: str = ""

    @field_validator("database_url")
    @classmethod
    def _driver(cls, v: str) -> str:
        v = v.strip()
        if v.startswith("mysql://"):  # accept provider-style URLs
            v = "mysql+pymysql://" + v[len("mysql://"):]
        return v

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip().rstrip("/") for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    try:
        return Settings()
    except ValidationError as exc:  # friendlier than a raw traceback
        raise SystemExit(
            "Configuration error: set the ADMIN_KEY environment variable (at least 8 characters).\n" + str(exc)
        ) from exc
