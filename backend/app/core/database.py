from collections.abc import Generator
from importlib.util import find_spec
from uuid import UUID

from fastapi import Request
from sqlalchemy import create_engine, event, text
from sqlalchemy.engine.url import make_url
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker, with_loader_criteria

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


engine = create_engine(_engine_url())
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


def get_db(request: Request) -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        request_user_id = getattr(request.state, "user_id", None)
        token_ctx = None
        if request_user_id:
            token_ctx = current_user_id_ctx.set(UUID(request_user_id))
        current_user_id = current_user_id_ctx.get()
        if current_user_id is not None:
            db.execute(
                text("select set_config('request.jwt.claim.sub', :user_id, false)"),
                {"user_id": str(current_user_id)},
            )
        yield db
    finally:
        if 'token_ctx' in locals() and token_ctx is not None:
            current_user_id_ctx.reset(token_ctx)
        db.close()
