from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.request_context import require_current_user_id
from app.models.application import Application
from app.models.application_history import ApplicationHistory
from app.schemas.application_history import ApplicationHistoryCreate, ApplicationHistoryUpdate


def get_history(db: Session, application_id: int) -> list[ApplicationHistory]:
    user_id = require_current_user_id()
    return (
        db.query(ApplicationHistory)
        .filter(ApplicationHistory.application_id == application_id, ApplicationHistory.user_id == user_id)
        .order_by(ApplicationHistory.date.asc())
        .all()
    )


def _get_latest_history_entry(
    db: Session,
    application_id: int,
    *,
    exclude_history_id: int | None = None,
) -> ApplicationHistory | None:
    user_id = require_current_user_id()
    q = db.query(ApplicationHistory).filter(ApplicationHistory.application_id == application_id, ApplicationHistory.user_id == user_id)
    if exclude_history_id is not None:
        q = q.filter(ApplicationHistory.id != exclude_history_id)
    return q.order_by(ApplicationHistory.date.desc()).first()


def _append_history_and_update_stage(
    db: Session,
    application: Application,
    stage: str,
    date,
    notes: str | None = None,
) -> ApplicationHistory:
    entry = ApplicationHistory(
        application_id=application.id,
        stage=stage,
        date=date,
        notes=notes,
    )
    db.add(entry)
    application.current_stage = stage
    db.flush()
    return entry


def advance_stage(db: Session, application_id: int, data: ApplicationHistoryCreate) -> ApplicationHistory:
    user_id = require_current_user_id()
    application = db.query(Application).filter(Application.id == application_id, Application.user_id == user_id).first()
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")

    entry = _append_history_and_update_stage(
        db=db,
        application=application,
        stage=data.stage,
        date=data.date,
        notes=data.notes,
    )
    db.commit()
    db.refresh(entry)
    return entry


def update_history_entry(
    db: Session,
    application_id: int,
    history_id: int,
    data: ApplicationHistoryUpdate,
) -> ApplicationHistory:
    entry = (
        db.query(ApplicationHistory)
        .filter(
            ApplicationHistory.id == history_id,
            ApplicationHistory.application_id == application_id,
            ApplicationHistory.user_id == require_current_user_id(),
        )
        .first()
    )
    if entry is None:
        raise HTTPException(status_code=404, detail="History entry not found")

    updates = data.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="At least one field must be provided")

    if "stage" in updates:
        stage_val = updates["stage"]
        if stage_val is None or (isinstance(stage_val, str) and not stage_val.strip()):
            raise HTTPException(status_code=400, detail="Stage cannot be empty")
        entry.stage = stage_val.strip()

    if "date" in updates:
        date_val = updates["date"]
        if date_val is None:
            raise HTTPException(status_code=400, detail="Date cannot be null")
        entry.date = date_val

    if "notes" in updates:
        entry.notes = updates["notes"]

    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == require_current_user_id(),
    ).first()
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")

    latest = _get_latest_history_entry(db, application_id)
    if latest is not None:
        application.current_stage = latest.stage

    db.commit()
    db.refresh(entry)
    return entry


def delete_history_entry(db: Session, application_id: int, history_id: int) -> bool:
    entry = (
        db.query(ApplicationHistory)
        .filter(
            ApplicationHistory.id == history_id,
            ApplicationHistory.application_id == application_id,
            ApplicationHistory.user_id == require_current_user_id(),
        )
        .first()
    )
    if entry is None:
        raise HTTPException(status_code=404, detail="History entry not found")

    remaining_count = (
        db.query(ApplicationHistory)
        .filter(ApplicationHistory.application_id == application_id, ApplicationHistory.user_id == require_current_user_id())
        .count()
    )
    if remaining_count <= 1:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete the last history entry of an application",
        )

    db.delete(entry)

    latest = _get_latest_history_entry(db, application_id, exclude_history_id=history_id)
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == require_current_user_id(),
    ).first()
    if application and latest:
        application.current_stage = latest.stage

    db.commit()
    return True
