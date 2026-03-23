from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.profile_skill import (
    SkillGroupCreate,
    SkillGroupResponse,
    SkillGroupUpdate,
    SkillItemCreate,
    SkillItemResponse,
    SkillItemUpdate,
    SkillReorderItem,
)
from app.services import profile_skill as profile_skill_service

router = APIRouter(prefix="/api/profile-skills", tags=["profile-skills"])


@router.get("/", response_model=list[SkillGroupResponse])
def list_skill_groups(db: Session = Depends(get_db)) -> list[SkillGroupResponse]:
    return profile_skill_service.get_all_skill_groups(db)


@router.post("/", response_model=SkillGroupResponse, status_code=201)
def create_skill_group(data: SkillGroupCreate, db: Session = Depends(get_db)) -> SkillGroupResponse:
    return profile_skill_service.create_skill_group(db, data)


@router.patch("/{group_id}", response_model=SkillGroupResponse)
def update_skill_group(group_id: int, data: SkillGroupUpdate, db: Session = Depends(get_db)) -> SkillGroupResponse:
    group = profile_skill_service.update_skill_group(db, group_id, data)
    if group is None:
        raise HTTPException(status_code=404, detail="Skill group not found")
    return group


@router.delete("/{group_id}", status_code=204)
def delete_skill_group(group_id: int, db: Session = Depends(get_db)) -> Response:
    deleted = profile_skill_service.delete_skill_group(db, group_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Skill group not found")
    return Response(status_code=204)


@router.patch("/reorder", response_model=list[SkillGroupResponse])
def reorder_skill_groups(items: list[SkillReorderItem], db: Session = Depends(get_db)) -> list[SkillGroupResponse]:
    return profile_skill_service.reorder_skill_groups(db, items)


@router.post("/{group_id}/items", response_model=SkillItemResponse, status_code=201)
def create_skill_item(group_id: int, data: SkillItemCreate, db: Session = Depends(get_db)) -> SkillItemResponse:
    item = profile_skill_service.create_skill_item(db, group_id, data)
    if item is None:
        raise HTTPException(status_code=404, detail="Skill group not found")
    return item


@router.patch("/items/{item_id}", response_model=SkillItemResponse)
def update_skill_item(item_id: int, data: SkillItemUpdate, db: Session = Depends(get_db)) -> SkillItemResponse:
    item = profile_skill_service.update_skill_item(db, item_id, data)
    if item is None:
        raise HTTPException(status_code=404, detail="Skill item not found")
    return item


@router.delete("/items/{item_id}", status_code=204)
def delete_skill_item(item_id: int, db: Session = Depends(get_db)) -> Response:
    deleted = profile_skill_service.delete_skill_item(db, item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Skill item not found")
    return Response(status_code=204)


@router.patch("/{group_id}/items/reorder", response_model=list[SkillItemResponse])
def reorder_skill_items(
    group_id: int,
    items: list[SkillReorderItem],
    db: Session = Depends(get_db),
) -> list[SkillItemResponse]:
    group_items = profile_skill_service.reorder_skill_items(db, group_id, items)
    if group_items is None:
        raise HTTPException(status_code=404, detail="Skill group not found")
    return group_items
