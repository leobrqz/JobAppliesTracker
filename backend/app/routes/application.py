from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.application import ApplicationCreate, ApplicationResponse, ApplicationUpdate
from app.services import application as application_service

router = APIRouter(prefix="/api/applications", tags=["applications"])


@router.get("/", response_model=list[ApplicationResponse])
def list_applications(
    status: Optional[str] = None,
    stage: Optional[str] = None,
    platform_id: Optional[int] = None,
    archived: bool = False,
    db: Session = Depends(get_db),
) -> list[ApplicationResponse]:
    return application_service.get_applications(
        db, status=status, stage=stage, platform_id=platform_id, archived=archived
    )


@router.post("/", response_model=ApplicationResponse, status_code=201)
def create_application(data: ApplicationCreate, db: Session = Depends(get_db)) -> ApplicationResponse:
    return application_service.create_application(db, data)


@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application(application_id: int, db: Session = Depends(get_db)) -> ApplicationResponse:
    application = application_service.get_application(db, application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    return application


@router.patch("/{application_id}", response_model=ApplicationResponse)
def update_application(
    application_id: int, data: ApplicationUpdate, db: Session = Depends(get_db)
) -> ApplicationResponse:
    application = application_service.update_application(db, application_id, data)
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    return application


@router.delete("/{application_id}", status_code=204)
def delete_application(application_id: int, db: Session = Depends(get_db)) -> Response:
    deleted = application_service.delete_application(db, application_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Application not found")
    return Response(status_code=204)


@router.post("/{application_id}/archive", response_model=ApplicationResponse)
def archive_application(application_id: int, db: Session = Depends(get_db)) -> ApplicationResponse:
    application = application_service.archive_application(db, application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    return application


@router.post("/{application_id}/restore", response_model=ApplicationResponse)
def restore_application(application_id: int, db: Session = Depends(get_db)) -> ApplicationResponse:
    application = application_service.restore_application(db, application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    return application
