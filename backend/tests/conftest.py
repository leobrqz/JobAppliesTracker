from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

import pytest
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.request_context import current_user_id_ctx


USER_A = UUID("00000000-0000-0000-0000-000000000001")
USER_B = UUID("00000000-0000-0000-0000-000000000002")


@pytest.fixture
def db_session() -> Session:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture
def user_a() -> UUID:
    return USER_A


@pytest.fixture
def user_b() -> UUID:
    return USER_B


@pytest.fixture
def now_utc() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


@pytest.fixture
def as_user():
    tokens: list = []

    def _set(user_id: UUID):
        token = current_user_id_ctx.set(user_id)
        tokens.append(token)

    yield _set
    while tokens:
        current_user_id_ctx.reset(tokens.pop())
