from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.profile_data import ProfileDataCreate, ProfileDataResponse, ProfileDataUpdate
from app.services import profile_data as profile_data_service

router = APIRouter(prefix="/api/profile-data", tags=["profile-data"])


@router.get("/", response_model=list[ProfileDataResponse])
def list_profile_data(db: Session = Depends(get_db)) -> list[ProfileDataResponse]:
    return profile_data_service.get_all_profile_data(db)


@router.post("/", response_model=ProfileDataResponse, status_code=201)
def create_profile_data(data: ProfileDataCreate, db: Session = Depends(get_db)) -> ProfileDataResponse:
    return profile_data_service.create_profile_data(db, data)


@router.get("/{profile_data_id}", response_model=ProfileDataResponse)
def get_profile_data(profile_data_id: int, db: Session = Depends(get_db)) -> ProfileDataResponse:
    entry = profile_data_service.get_profile_data(db, profile_data_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Profile data entry not found")
    return entry


@router.patch("/{profile_data_id}", response_model=ProfileDataResponse)
def update_profile_data(
    profile_data_id: int, data: ProfileDataUpdate, db: Session = Depends(get_db)
) -> ProfileDataResponse:
    entry = profile_data_service.update_profile_data(db, profile_data_id, data)
    if entry is None:
        raise HTTPException(status_code=404, detail="Profile data entry not found")
    return entry


@router.delete("/{profile_data_id}", status_code=204)
def delete_profile_data(profile_data_id: int, db: Session = Depends(get_db)) -> Response:
    deleted = profile_data_service.delete_profile_data(db, profile_data_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Profile data entry not found")
    return Response(status_code=204)
