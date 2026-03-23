from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.profile_about_me import ProfileAboutMeResponse, ProfileAboutMeUpdate
from app.services import profile_about_me as profile_about_me_service

router = APIRouter(prefix="/api/profile-about-me", tags=["profile-about-me"])


@router.get("/", response_model=ProfileAboutMeResponse)
def get_about_me(db: Session = Depends(get_db)) -> ProfileAboutMeResponse:
    return profile_about_me_service.get_about_me(db)


@router.put("/", response_model=ProfileAboutMeResponse)
def update_about_me(data: ProfileAboutMeUpdate, db: Session = Depends(get_db)) -> ProfileAboutMeResponse:
    return profile_about_me_service.update_about_me(db, data)
