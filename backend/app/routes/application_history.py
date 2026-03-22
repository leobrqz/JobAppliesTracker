from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.application_history import (
    ApplicationHistoryCreate,
    ApplicationHistoryResponse,
    ApplicationHistoryUpdate,
)
from app.services import application_history as history_service

router = APIRouter(prefix="/api/applications", tags=["application-history"])


@router.get("/{application_id}/history", response_model=list[ApplicationHistoryResponse])
def list_history(application_id: int, db: Session = Depends(get_db)) -> list[ApplicationHistoryResponse]:
    return history_service.get_history(db, application_id)


@router.post("/{application_id}/history", response_model=ApplicationHistoryResponse, status_code=201)
def add_history_entry(
    application_id: int, data: ApplicationHistoryCreate, db: Session = Depends(get_db)
) -> ApplicationHistoryResponse:
    return history_service.advance_stage(db, application_id, data)


@router.patch("/{application_id}/history/{history_id}", response_model=ApplicationHistoryResponse)
def patch_history_entry(
    application_id: int,
    history_id: int,
    data: ApplicationHistoryUpdate,
    db: Session = Depends(get_db),
) -> ApplicationHistoryResponse:
    return history_service.update_history_entry(db, application_id, history_id, data)


@router.delete("/{application_id}/history/{history_id}", status_code=204)
def delete_history_entry(
    application_id: int, history_id: int, db: Session = Depends(get_db)
) -> Response:
    history_service.delete_history_entry(db, application_id, history_id)
    return Response(status_code=204)
