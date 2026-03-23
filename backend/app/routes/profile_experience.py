from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.profile_experience import (
    ExperienceBulletCreate,
    ExperienceBulletResponse,
    ExperienceBulletUpdate,
    ExperienceEntryCreate,
    ExperienceEntryResponse,
    ExperienceEntryUpdate,
    ExperienceReorderItem,
)
from app.services import profile_experience as profile_experience_service

router = APIRouter(prefix="/api/profile-experience", tags=["profile-experience"])


@router.get("/", response_model=list[ExperienceEntryResponse])
def list_experience_entries(db: Session = Depends(get_db)) -> list[ExperienceEntryResponse]:
    return profile_experience_service.get_all_experience_entries(db)


@router.post("/", response_model=ExperienceEntryResponse, status_code=201)
def create_experience_entry(data: ExperienceEntryCreate, db: Session = Depends(get_db)) -> ExperienceEntryResponse:
    return profile_experience_service.create_experience_entry(db, data)


@router.patch("/{entry_id}", response_model=ExperienceEntryResponse)
def update_experience_entry(
    entry_id: int,
    data: ExperienceEntryUpdate,
    db: Session = Depends(get_db),
) -> ExperienceEntryResponse:
    entry = profile_experience_service.update_experience_entry(db, entry_id, data)
    if entry is None:
        raise HTTPException(status_code=404, detail="Experience entry not found")
    return entry


@router.delete("/{entry_id}", status_code=204)
def delete_experience_entry(entry_id: int, db: Session = Depends(get_db)) -> Response:
    deleted = profile_experience_service.delete_experience_entry(db, entry_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Experience entry not found")
    return Response(status_code=204)


@router.patch("/reorder", response_model=list[ExperienceEntryResponse])
def reorder_experience_entries(
    items: list[ExperienceReorderItem],
    db: Session = Depends(get_db),
) -> list[ExperienceEntryResponse]:
    return profile_experience_service.reorder_experience_entries(db, items)


@router.post("/{entry_id}/bullets", response_model=ExperienceBulletResponse, status_code=201)
def create_experience_bullet(
    entry_id: int,
    data: ExperienceBulletCreate,
    db: Session = Depends(get_db),
) -> ExperienceBulletResponse:
    bullet = profile_experience_service.create_experience_bullet(db, entry_id, data)
    if bullet is None:
        raise HTTPException(status_code=404, detail="Experience entry not found")
    return bullet


@router.patch("/bullets/{bullet_id}", response_model=ExperienceBulletResponse)
def update_experience_bullet(
    bullet_id: int,
    data: ExperienceBulletUpdate,
    db: Session = Depends(get_db),
) -> ExperienceBulletResponse:
    bullet = profile_experience_service.update_experience_bullet(db, bullet_id, data)
    if bullet is None:
        raise HTTPException(status_code=404, detail="Experience bullet not found")
    return bullet


@router.delete("/bullets/{bullet_id}", status_code=204)
def delete_experience_bullet(bullet_id: int, db: Session = Depends(get_db)) -> Response:
    deleted = profile_experience_service.delete_experience_bullet(db, bullet_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Experience bullet not found")
    return Response(status_code=204)


@router.patch("/{entry_id}/bullets/reorder", response_model=list[ExperienceBulletResponse])
def reorder_experience_bullets(
    entry_id: int,
    items: list[ExperienceReorderItem],
    db: Session = Depends(get_db),
) -> list[ExperienceBulletResponse]:
    bullets = profile_experience_service.reorder_experience_bullets(db, entry_id, items)
    if bullets is None:
        raise HTTPException(status_code=404, detail="Experience entry not found")
    return bullets
