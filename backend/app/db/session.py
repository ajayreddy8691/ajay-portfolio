import logging
from collections.abc import Iterator
from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings

log = logging.getLogger("portfolio.db")
url = make_url(get_settings().database_url)
backend = url.get_backend_name()


class Base(DeclarativeBase):
    pass


connect_args: dict = {}
if backend == "sqlite":
    connect_args = {"check_same_thread": False}
    if url.database and url.database != ":memory:":
        Path(url.database).parent.mkdir(parents=True, exist_ok=True)
elif backend == "mysql":
    connect_args = {"charset": "utf8mb4"}

engine = create_engine(url, pool_pre_ping=True, pool_recycle=280, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _ensure_mysql_database() -> None:
    """Create the MySQL database when it does not exist (skipped quietly if the user lacks the privilege)."""
    if backend != "mysql" or not url.database:
        return
    try:
        admin = create_engine(url.set(database=None), isolation_level="AUTOCOMMIT", connect_args=connect_args)
        with admin.connect() as conn:
            conn.execute(text(f"CREATE DATABASE IF NOT EXISTS `{url.database}` CHARACTER SET utf8mb4"))
        admin.dispose()
    except Exception as exc:  # noqa: BLE001
        log.warning("Could not auto-create database %s: %s", url.database, exc)


def init_db() -> None:
    _ensure_mysql_database()
    from app import models  # noqa: F401  (registers the tables)

    Base.metadata.create_all(engine)
