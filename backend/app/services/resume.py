import os
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.storage import delete_file, get_file_path, save_file
from app.models.resume import Resume
from app.schemas.resume import ResumeCreate, ResumeUpdate


def get_resume(db: Session, resume_id: int) -> Resume | None:
    return db.query(Resume).filter(Resume.id == resume_id).first()


def get_resumes(db: Session, archived: bool = False) -> list[Resume]:
    query = db.query(Resume)
    if archived:
        query = query.filter(Resume.archived_at.is_not(None))
    else:
        query = query.filter(Resume.archived_at.is_(None))
    return query.order_by(Resume.created_at.desc()).all()


def upload_resume(db: Session, name: str, description: str | None, data: bytes) -> Resume:
    stored_path = save_file(name, data)
    resume = Resume(name=name, description=description, file_path=stored_path)
    db.add(resume)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        delete_file(stored_path)
        raise HTTPException(status_code=409, detail="A resume with this name already exists")
    db.refresh(resume)
    return resume


def update_resume(db: Session, resume_id: int, data: ResumeUpdate) -> Resume | None:
    resume = get_resume(db, resume_id)
    if resume is None:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(resume, field, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="A resume with this name already exists")
    db.refresh(resume)
    return resume


def delete_resume(db: Session, resume_id: int) -> bool:
    resume = get_resume(db, resume_id)
    if resume is None:
        return False
    stored_path = resume.file_path
    db.delete(resume)
    db.commit()
    delete_file(stored_path)
    return True


def archive_resume(db: Session, resume_id: int) -> Resume | None:
    resume = get_resume(db, resume_id)
    if resume is None:
        return None
    resume.archived_at = datetime.now(timezone.utc).replace(tzinfo=None)
    db.commit()
    db.refresh(resume)
    return resume


def restore_resume(db: Session, resume_id: int) -> Resume | None:
    resume = get_resume(db, resume_id)
    if resume is None:
        return None
    resume.archived_at = None
    db.commit()
    db.refresh(resume)
    return resume


def get_resume_for_download(db: Session, resume_id: int) -> tuple[Resume, str]:
    resume = get_resume(db, resume_id)
    if resume is None:
        raise HTTPException(status_code=404, detail="Resume not found")
    if resume.archived_at is not None:
        raise HTTPException(status_code=404, detail="Resume is archived")
    resolved_path = get_file_path(resume.file_path)
    if not os.path.exists(resolved_path):
        raise HTTPException(status_code=404, detail="Resume file not found on disk")
    return resume, resolved_path
