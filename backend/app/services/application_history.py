from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.application import Application
from app.models.application_history import ApplicationHistory
from app.schemas.application_history import ApplicationHistoryCreate


def get_history(db: Session, application_id: int) -> list[ApplicationHistory]:
    return (
        db.query(ApplicationHistory)
        .filter(ApplicationHistory.application_id == application_id)
        .order_by(ApplicationHistory.date.asc())
        .all()
    )


def advance_stage(db: Session, application_id: int, data: ApplicationHistoryCreate) -> ApplicationHistory:
    application = db.query(Application).filter(Application.id == application_id).first()
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")

    entry = ApplicationHistory(
        application_id=application_id,
        stage=data.stage,
        date=data.date,
        notes=data.notes,
    )
    db.add(entry)
    application.current_stage = data.stage
    db.commit()
    db.refresh(entry)
    return entry


def delete_history_entry(db: Session, application_id: int, history_id: int) -> bool:
    entry = (
        db.query(ApplicationHistory)
        .filter(
            ApplicationHistory.id == history_id,
            ApplicationHistory.application_id == application_id,
        )
        .first()
    )
    if entry is None:
        raise HTTPException(status_code=404, detail="History entry not found")

    remaining_count = (
        db.query(ApplicationHistory)
        .filter(ApplicationHistory.application_id == application_id)
        .count()
    )
    if remaining_count <= 1:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete the last history entry of an application",
        )

    db.delete(entry)

    latest = (
        db.query(ApplicationHistory)
        .filter(
            ApplicationHistory.application_id == application_id,
            ApplicationHistory.id != history_id,
        )
        .order_by(ApplicationHistory.date.desc())
        .first()
    )
    application = db.query(Application).filter(Application.id == application_id).first()
    if application and latest:
        application.current_stage = latest.stage

    db.commit()
    return True
