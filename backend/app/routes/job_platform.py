from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.job_platform import JobPlatformCreate, JobPlatformResponse, JobPlatformUpdate
from app.services import job_platform as job_platform_service

router = APIRouter(prefix="/api/job-platforms", tags=["job-platforms"])


@router.get("/", response_model=list[JobPlatformResponse])
def list_job_platforms(db: Session = Depends(get_db)) -> list[JobPlatformResponse]:
    return job_platform_service.get_job_platforms(db)


@router.post("/", response_model=JobPlatformResponse, status_code=201)
def create_job_platform(data: JobPlatformCreate, db: Session = Depends(get_db)) -> JobPlatformResponse:
    return job_platform_service.create_job_platform(db, data)


@router.get("/{platform_id}", response_model=JobPlatformResponse)
def get_job_platform(platform_id: int, db: Session = Depends(get_db)) -> JobPlatformResponse:
    platform = job_platform_service.get_job_platform(db, platform_id)
    if platform is None:
        raise HTTPException(status_code=404, detail="Job platform not found")
    return platform


@router.patch("/{platform_id}", response_model=JobPlatformResponse)
def update_job_platform(
    platform_id: int, data: JobPlatformUpdate, db: Session = Depends(get_db)
) -> JobPlatformResponse:
    platform = job_platform_service.update_job_platform(db, platform_id, data)
    if platform is None:
        raise HTTPException(status_code=404, detail="Job platform not found")
    return platform


@router.delete("/{platform_id}", status_code=204)
def delete_job_platform(platform_id: int, db: Session = Depends(get_db)) -> Response:
    deleted = job_platform_service.delete_job_platform(db, platform_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Job platform not found")
    return Response(status_code=204)
