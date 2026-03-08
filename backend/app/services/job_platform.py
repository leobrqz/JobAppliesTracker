from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.job_platform import JobPlatform
from app.schemas.job_platform import JobPlatformCreate, JobPlatformUpdate
from fastapi import HTTPException


def get_job_platform(db: Session, platform_id: int) -> JobPlatform | None:
    return db.query(JobPlatform).filter(JobPlatform.id == platform_id).first()


def get_job_platforms(db: Session) -> list[JobPlatform]:
    return db.query(JobPlatform).order_by(JobPlatform.name).all()


def create_job_platform(db: Session, data: JobPlatformCreate) -> JobPlatform:
    platform = JobPlatform(
        name=data.name,
        icon=data.icon,
        base_url=data.base_url,
        applications_url=data.applications_url,
        registered_at=data.registered_at,
        manual_resume=data.manual_resume,
    )
    db.add(platform)
    db.commit()
    db.refresh(platform)
    return platform


def update_job_platform(db: Session, platform_id: int, data: JobPlatformUpdate) -> JobPlatform | None:
    platform = get_job_platform(db, platform_id)
    if platform is None:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(platform, field, value)
    db.commit()
    db.refresh(platform)
    return platform


def delete_job_platform(db: Session, platform_id: int) -> bool:
    platform = get_job_platform(db, platform_id)
    if platform is None:
        return False
    try:
        db.delete(platform)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Platform has existing applications and cannot be deleted")
    return True
