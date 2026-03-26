from uuid import uuid4

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.request_context import require_current_user_id
from app.core.storage import StorageError, delete_file, read_file_bytes, save_file
from app.models.profile_course import CourseEntry
from app.schemas.profile_course import CourseEntryCreate, CourseEntryUpdate, CourseReorderItem

ALLOWED_MIME_TYPES = {"application/pdf", "image/png", "image/jpeg"}


def _reindex_entries(db: Session) -> None:
    entries = db.query(CourseEntry).order_by(CourseEntry.display_order, CourseEntry.id).all()
    for index, entry in enumerate(entries):
        entry.display_order = index


def _store_attachment(file_name: str, data: bytes, mime_type: str) -> str:
    user_id = require_current_user_id()
    stored_name = f"users/{user_id}/courses/{uuid4().hex}-{file_name}"
    return save_file(
        stored_name,
        data,
        content_type=mime_type or "application/octet-stream",
    )


def get_course(db: Session, entry_id: int) -> CourseEntry | None:
    user_id = require_current_user_id()
    return db.query(CourseEntry).filter(CourseEntry.id == entry_id, CourseEntry.user_id == user_id).first()


def list_courses(db: Session) -> list[CourseEntry]:
    user_id = require_current_user_id()
    return db.query(CourseEntry).filter(CourseEntry.user_id == user_id).order_by(CourseEntry.display_order, CourseEntry.id).all()


def create_course(db: Session, data: CourseEntryCreate) -> CourseEntry:
    user_id = require_current_user_id()
    entry = CourseEntry(
        user_id=user_id,
        title=data.title,
        provider=data.provider,
        completed_on=data.completed_on,
        duration_hours=data.duration_hours,
        verification_link=str(data.verification_link) if data.verification_link else None,
        notes=data.notes,
        display_order=db.query(CourseEntry).filter(CourseEntry.user_id == user_id).count(),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def update_course(db: Session, entry_id: int, data: CourseEntryUpdate) -> CourseEntry | None:
    entry = get_course(db, entry_id)
    if entry is None:
        return None
    payload = data.model_dump(exclude_unset=True)
    if "verification_link" in payload and payload["verification_link"] is not None:
        payload["verification_link"] = str(payload["verification_link"])
    for field, value in payload.items():
        setattr(entry, field, value)
    db.commit()
    db.refresh(entry)
    return entry


def delete_course(db: Session, entry_id: int) -> bool:
    entry = get_course(db, entry_id)
    if entry is None:
        return False
    path = entry.attachment_file_path
    db.delete(entry)
    db.flush()
    _reindex_entries(db)
    db.commit()
    if path:
        delete_file(path)
    return True


def reorder_courses(db: Session, items: list[CourseReorderItem]) -> list[CourseEntry]:
    user_id = require_current_user_id()
    item_map = {item.id: item.display_order for item in items}
    entries = db.query(CourseEntry).filter(CourseEntry.user_id == user_id).all()
    for entry in entries:
        if entry.id in item_map:
            entry.display_order = item_map[entry.id]
    db.flush()
    _reindex_entries(db)
    db.commit()
    return list_courses(db)


def upload_attachment(db: Session, entry_id: int, file_name: str, mime_type: str, data: bytes) -> CourseEntry | None:
    entry = get_course(db, entry_id)
    if entry is None:
        return None
    if mime_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type. Allowed: PDF, PNG, JPEG")
    old_path = entry.attachment_file_path
    try:
        stored_path = _store_attachment(file_name, data, mime_type)
    except StorageError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    entry.attachment_file_path = stored_path
    entry.attachment_file_name = file_name
    entry.attachment_mime_type = mime_type
    db.commit()
    db.refresh(entry)
    if old_path:
        delete_file(old_path)
    return entry


def remove_attachment(db: Session, entry_id: int) -> CourseEntry | None:
    entry = get_course(db, entry_id)
    if entry is None:
        return None
    old_path = entry.attachment_file_path
    entry.attachment_file_path = None
    entry.attachment_file_name = None
    entry.attachment_mime_type = None
    db.commit()
    db.refresh(entry)
    if old_path:
        delete_file(old_path)
    return entry


def get_attachment_download(db: Session, entry_id: int) -> tuple[CourseEntry, bytes]:
    entry = get_course(db, entry_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Course not found")
    if not entry.attachment_file_path:
        raise HTTPException(status_code=404, detail="Attachment not found")
    try:
        data = read_file_bytes(entry.attachment_file_path)
    except StorageError:
        raise HTTPException(status_code=404, detail="Attachment file not found") from None
    return entry, data
