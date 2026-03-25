from __future__ import annotations

from typing import TYPE_CHECKING

from app.core.config import settings

if TYPE_CHECKING:
    from supabase import Client


class StorageError(Exception):
    pass


def _supabase_enabled() -> bool:
    url = (settings.SUPABASE_URL or "").strip()
    key = (settings.SUPABASE_SERVICE_ROLE_KEY or "").strip()
    return bool(url and key)

def _require_supabase_enabled() -> None:
    if not _supabase_enabled():
        raise StorageError(
            "Supabase Storage is required. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env."
        )


def _get_supabase_client() -> Client:
    from supabase import create_client

    base = settings.SUPABASE_URL.strip().rstrip("/") + "/"
    return create_client(base, settings.SUPABASE_SERVICE_ROLE_KEY.strip())


def save_file(name: str, data: bytes, *, content_type: str | None = None) -> str:
    _require_supabase_enabled()

    bucket = settings.SUPABASE_STORAGE_BUCKET
    opts: dict[str, str] = {"upsert": "false"}
    if content_type:
        opts["content-type"] = content_type
    client = _get_supabase_client()
    try:
        client.storage.from_(bucket).upload(
            path=name,
            file=data,
            file_options=opts,
        )
    except Exception as exc:
        raise StorageError(f"Storage upload failed: {exc}") from exc
    return name


def read_file_bytes(stored_path: str) -> bytes:
    _require_supabase_enabled()

    bucket = settings.SUPABASE_STORAGE_BUCKET
    client = _get_supabase_client()
    try:
        res = client.storage.from_(bucket).download(stored_path)
    except Exception as exc:
        raise StorageError(f"Storage download failed: {exc}") from exc
    if isinstance(res, bytes):
        return res
    if hasattr(res, "data") and isinstance(res.data, bytes):
        return res.data
    raise StorageError("Storage download returned no bytes")


def delete_file(stored_path: str) -> None:
    _require_supabase_enabled()

    bucket = settings.SUPABASE_STORAGE_BUCKET
    client = _get_supabase_client()
    try:
        client.storage.from_(bucket).remove([stored_path])
    except Exception:
        pass
