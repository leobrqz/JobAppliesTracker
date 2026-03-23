from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.profile_education import (
    EducationEntryCreate,
    EducationEntryResponse,
    EducationEntryUpdate,
    EducationHighlightCreate,
    EducationHighlightResponse,
    EducationHighlightUpdate,
    EducationReorderItem,
)
from app.services import profile_education as profile_education_service

router = APIRouter(prefix="/api/profile-education", tags=["profile-education"])


@router.get("/", response_model=list[EducationEntryResponse])
def list_education_entries(db: Session = Depends(get_db)) -> list[EducationEntryResponse]:
    return profile_education_service.get_all_education_entries(db)


@router.post("/", response_model=EducationEntryResponse, status_code=201)
def create_education_entry(data: EducationEntryCreate, db: Session = Depends(get_db)) -> EducationEntryResponse:
    return profile_education_service.create_education_entry(db, data)


@router.patch("/{entry_id}", response_model=EducationEntryResponse)
def update_education_entry(
    entry_id: int,
    data: EducationEntryUpdate,
    db: Session = Depends(get_db),
) -> EducationEntryResponse:
    entry = profile_education_service.update_education_entry(db, entry_id, data)
    if entry is None:
        raise HTTPException(status_code=404, detail="Education entry not found")
    return entry


@router.delete("/{entry_id}", status_code=204)
def delete_education_entry(entry_id: int, db: Session = Depends(get_db)) -> Response:
    deleted = profile_education_service.delete_education_entry(db, entry_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Education entry not found")
    return Response(status_code=204)


@router.patch("/reorder", response_model=list[EducationEntryResponse])
def reorder_education_entries(
    items: list[EducationReorderItem],
    db: Session = Depends(get_db),
) -> list[EducationEntryResponse]:
    return profile_education_service.reorder_education_entries(db, items)


@router.post("/{entry_id}/highlights", response_model=EducationHighlightResponse, status_code=201)
def create_education_highlight(
    entry_id: int,
    data: EducationHighlightCreate,
    db: Session = Depends(get_db),
) -> EducationHighlightResponse:
    highlight = profile_education_service.create_education_highlight(db, entry_id, data)
    if highlight is None:
        raise HTTPException(status_code=404, detail="Education entry not found")
    return highlight


@router.patch("/highlights/{highlight_id}", response_model=EducationHighlightResponse)
def update_education_highlight(
    highlight_id: int,
    data: EducationHighlightUpdate,
    db: Session = Depends(get_db),
) -> EducationHighlightResponse:
    highlight = profile_education_service.update_education_highlight(db, highlight_id, data)
    if highlight is None:
        raise HTTPException(status_code=404, detail="Education highlight not found")
    return highlight


@router.delete("/highlights/{highlight_id}", status_code=204)
def delete_education_highlight(highlight_id: int, db: Session = Depends(get_db)) -> Response:
    deleted = profile_education_service.delete_education_highlight(db, highlight_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Education highlight not found")
    return Response(status_code=204)


@router.patch("/{entry_id}/highlights/reorder", response_model=list[EducationHighlightResponse])
def reorder_education_highlights(
    entry_id: int,
    items: list[EducationReorderItem],
    db: Session = Depends(get_db),
) -> list[EducationHighlightResponse]:
    highlights = profile_education_service.reorder_education_highlights(db, entry_id, items)
    if highlights is None:
        raise HTTPException(status_code=404, detail="Education entry not found")
    return highlights
