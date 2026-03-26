from collections.abc import Generator
from importlib.util import find_spec
from fastapi import Request
from sqlalchemy import create_engine, event
from sqlalchemy.engine.url import make_url
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker, with_loader_criteria
from sqlalchemy.pool import NullPool

from app.core.config import settings
from app.core.request_context import current_user_id_ctx


class Base(DeclarativeBase):
    pass


def _engine_url():
    u = make_url(settings.DATABASE_URL)
    if u.drivername in {"postgresql", "postgres"}:
        if find_spec("psycopg") is not None:
            u = u.set(drivername="postgresql+psycopg")
        elif find_spec("psycopg2") is not None:
            u = u.set(drivername="postgresql+psycopg2")
    return u


engine = create_engine(_engine_url(), poolclass=NullPool)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


@event.listens_for(SessionLocal, "do_orm_execute")
def _apply_user_scope(execute_state) -> None:
    user_id = current_user_id_ctx.get()
    if user_id is None:
        return
    if not execute_state.is_select:
        return

    statement = execute_state.statement
    for mapper in Base.registry.mappers:
        cls = mapper.class_
        if hasattr(cls, "user_id"):
            statement = statement.options(
                with_loader_criteria(
                    cls,
                    lambda model_cls: model_cls.user_id == user_id,
                    include_aliases=True,
                )
            )
    execute_state.statement = statement


@event.listens_for(SessionLocal, "before_flush")
def _set_user_id_on_new_entities(session: Session, flush_context, instances) -> None:
    user_id = current_user_id_ctx.get()
    if user_id is None:
        return
    for obj in session.new:
        if hasattr(obj, "user_id") and getattr(obj, "user_id", None) is None:
            setattr(obj, "user_id", user_id)


def get_db(request: Request) -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.rollback()
        db.close()
