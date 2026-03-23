from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.profile_project import (
    ProjectBulletCreate,
    ProjectBulletResponse,
    ProjectBulletUpdate,
    ProjectEntryCreate,
    ProjectEntryResponse,
    ProjectEntryUpdate,
    ProjectReorderItem,
)
from app.services import profile_project as profile_project_service

router = APIRouter(prefix="/api/profile-projects", tags=["profile-projects"])


@router.get("/", response_model=list[ProjectEntryResponse])
def list_project_entries(db: Session = Depends(get_db)) -> list[ProjectEntryResponse]:
    return profile_project_service.get_all_project_entries(db)


@router.post("/", response_model=ProjectEntryResponse, status_code=201)
def create_project_entry(data: ProjectEntryCreate, db: Session = Depends(get_db)) -> ProjectEntryResponse:
    return profile_project_service.create_project_entry(db, data)


@router.patch("/{entry_id}", response_model=ProjectEntryResponse)
def update_project_entry(
    entry_id: int,
    data: ProjectEntryUpdate,
    db: Session = Depends(get_db),
) -> ProjectEntryResponse:
    entry = profile_project_service.update_project_entry(db, entry_id, data)
    if entry is None:
        raise HTTPException(status_code=404, detail="Project entry not found")
    return entry


@router.delete("/{entry_id}", status_code=204)
def delete_project_entry(entry_id: int, db: Session = Depends(get_db)) -> Response:
    deleted = profile_project_service.delete_project_entry(db, entry_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Project entry not found")
    return Response(status_code=204)


@router.patch("/reorder", response_model=list[ProjectEntryResponse])
def reorder_project_entries(
    items: list[ProjectReorderItem],
    db: Session = Depends(get_db),
) -> list[ProjectEntryResponse]:
    return profile_project_service.reorder_project_entries(db, items)


@router.post("/{entry_id}/bullets", response_model=ProjectBulletResponse, status_code=201)
def create_project_bullet(
    entry_id: int,
    data: ProjectBulletCreate,
    db: Session = Depends(get_db),
) -> ProjectBulletResponse:
    bullet = profile_project_service.create_project_bullet(db, entry_id, data)
    if bullet is None:
        raise HTTPException(status_code=404, detail="Project entry not found")
    return bullet


@router.patch("/bullets/{bullet_id}", response_model=ProjectBulletResponse)
def update_project_bullet(
    bullet_id: int,
    data: ProjectBulletUpdate,
    db: Session = Depends(get_db),
) -> ProjectBulletResponse:
    bullet = profile_project_service.update_project_bullet(db, bullet_id, data)
    if bullet is None:
        raise HTTPException(status_code=404, detail="Project bullet not found")
    return bullet


@router.delete("/bullets/{bullet_id}", status_code=204)
def delete_project_bullet(bullet_id: int, db: Session = Depends(get_db)) -> Response:
    deleted = profile_project_service.delete_project_bullet(db, bullet_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Project bullet not found")
    return Response(status_code=204)


@router.patch("/{entry_id}/bullets/reorder", response_model=list[ProjectBulletResponse])
def reorder_project_bullets(
    entry_id: int,
    items: list[ProjectReorderItem],
    db: Session = Depends(get_db),
) -> list[ProjectBulletResponse]:
    bullets = profile_project_service.reorder_project_bullets(db, entry_id, items)
    if bullets is None:
        raise HTTPException(status_code=404, detail="Project entry not found")
    return bullets
