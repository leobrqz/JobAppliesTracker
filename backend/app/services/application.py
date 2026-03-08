from datetime import date, datetime, time, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.models.application import Application
from app.models.application_history import ApplicationHistory
from app.schemas.application import ApplicationCreate, ApplicationUpdate


def get_application(db: Session, application_id: int) -> Application | None:
    return db.query(Application).filter(Application.id == application_id).first()


def get_applications(
    db: Session,
    status: Optional[str] = None,
    stage: Optional[str] = None,
    platform_id: Optional[int] = None,
    archived: bool = False,
) -> list[Application]:
    query = db.query(Application)
    if archived:
        query = query.filter(Application.archived_at.is_not(None))
    else:
        query = query.filter(Application.archived_at.is_(None))
    if status is not None:
        query = query.filter(Application.status == status)
    if stage is not None:
        query = query.filter(Application.current_stage == stage)
    if platform_id is not None:
        query = query.filter(Application.platform_id == platform_id)
    return query.order_by(Application.applied_at.desc()).all()


def create_application(db: Session, data: ApplicationCreate) -> Application:
    applied_at_dt = datetime.combine(data.applied_at, time.min)

    application = Application(
        platform_id=data.platform_id,
        job_title=data.job_title,
        company=data.company,
        salary=data.salary,
        seniority=data.seniority,
        contract_type=data.contract_type,
        application_url=data.application_url,
        current_stage=data.current_stage,
        status=data.status,
        applied_at=applied_at_dt,
        resume_id=data.resume_id,
    )
    db.add(application)
    db.flush()

    first_history = ApplicationHistory(
        application_id=application.id,
        stage=data.current_stage,
        date=applied_at_dt,
    )
    db.add(first_history)
    db.commit()
    db.refresh(application)
    return application


def update_application(db: Session, application_id: int, data: ApplicationUpdate) -> Application | None:
    application = get_application(db, application_id)
    if application is None:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        if field == "applied_at" and isinstance(value, date) and not isinstance(value, datetime):
            value = datetime.combine(value, time.min)
        setattr(application, field, value)
    db.commit()
    db.refresh(application)
    return application


def delete_application(db: Session, application_id: int) -> bool:
    application = get_application(db, application_id)
    if application is None:
        return False
    db.delete(application)
    db.commit()
    return True


def archive_application(db: Session, application_id: int) -> Application | None:
    application = get_application(db, application_id)
    if application is None:
        return None
    application.archived_at = datetime.now(timezone.utc).replace(tzinfo=None)
    db.commit()
    db.refresh(application)
    return application


def restore_application(db: Session, application_id: int) -> Application | None:
    application = get_application(db, application_id)
    if application is None:
        return None
    application.archived_at = None
    db.commit()
    db.refresh(application)
    return application
