from __future__ import annotations

from contextvars import ContextVar
from uuid import UUID


current_user_id_ctx: ContextVar[UUID | None] = ContextVar("current_user_id_ctx", default=None)

