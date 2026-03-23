import os
from uuid import uuid4

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.storage import delete_file, get_file_path, save_file
from app.models.profile_certification import CertificationEntry
from app.schemas.profile_certification import (
    CertificationEntryCreate,
    CertificationEntryUpdate,
    CertificationReorderItem,
)

ALLOWED_MIME_TYPES = {"application/pdf", "image/png", "image/jpeg"}


def _reindex_entries(db: Session) -> None:
    entries = db.query(CertificationEntry).order_by(CertificationEntry.display_order, CertificationEntry.id).all()
    for index, entry in enumerate(entries):
        entry.display_order = index


def _store_attachment(file_name: str, data: bytes) -> str:
    stored_name = f"certifications/{uuid4().hex}-{file_name}"
    return save_file(stored_name, data)


def get_certification(db: Session, entry_id: int) -> CertificationEntry | None:
    return db.query(CertificationEntry).filter(CertificationEntry.id == entry_id).first()


def list_certifications(db: Session) -> list[CertificationEntry]:
    return db.query(CertificationEntry).order_by(CertificationEntry.display_order, CertificationEntry.id).all()


def create_certification(db: Session, data: CertificationEntryCreate) -> CertificationEntry:
    entry = CertificationEntry(
        name=data.name,
        issuer=data.issuer,
        issued_on=data.issued_on,
        expires_on=data.expires_on,
        credential_id=data.credential_id,
        verification_link=str(data.verification_link) if data.verification_link else None,
        notes=data.notes,
        display_order=db.query(CertificationEntry).count(),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def update_certification(db: Session, entry_id: int, data: CertificationEntryUpdate) -> CertificationEntry | None:
    entry = get_certification(db, entry_id)
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


def delete_certification(db: Session, entry_id: int) -> bool:
    entry = get_certification(db, entry_id)
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


def reorder_certifications(db: Session, items: list[CertificationReorderItem]) -> list[CertificationEntry]:
    item_map = {item.id: item.display_order for item in items}
    entries = db.query(CertificationEntry).all()
    for entry in entries:
        if entry.id in item_map:
            entry.display_order = item_map[entry.id]
    db.flush()
    _reindex_entries(db)
    db.commit()
    return list_certifications(db)


def upload_attachment(db: Session, entry_id: int, file_name: str, mime_type: str, data: bytes) -> CertificationEntry | None:
    entry = get_certification(db, entry_id)
    if entry is None:
        return None
    if mime_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type. Allowed: PDF, PNG, JPEG")
    old_path = entry.attachment_file_path
    stored_path = _store_attachment(file_name, data)
    entry.attachment_file_path = stored_path
    entry.attachment_file_name = file_name
    entry.attachment_mime_type = mime_type
    db.commit()
    db.refresh(entry)
    if old_path:
        delete_file(old_path)
    return entry


def remove_attachment(db: Session, entry_id: int) -> CertificationEntry | None:
    entry = get_certification(db, entry_id)
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


def get_attachment_download(db: Session, entry_id: int) -> tuple[CertificationEntry, str]:
    entry = get_certification(db, entry_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Certification not found")
    if not entry.attachment_file_path:
        raise HTTPException(status_code=404, detail="Attachment not found")
    resolved = get_file_path(entry.attachment_file_path)
    if not os.path.exists(resolved):
        raise HTTPException(status_code=404, detail="Attachment file not found on disk")
    return entry, resolved
