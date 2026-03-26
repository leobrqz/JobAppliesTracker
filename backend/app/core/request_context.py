from __future__ import annotations

from contextvars import ContextVar
from uuid import UUID

from fastapi import HTTPException


current_user_id_ctx: ContextVar[UUID | None] = ContextVar("current_user_id_ctx", default=None)


def require_current_user_id() -> UUID:
    user_id = current_user_id_ctx.get()
    if user_id is None:
        raise HTTPException(status_code=401, detail="Missing authenticated user context")
    return user_id

