from sqlalchemy.orm import Session

from app.models.profile_skill import SkillGroup, SkillItem
from app.schemas.profile_skill import (
    SkillGroupCreate,
    SkillGroupUpdate,
    SkillItemCreate,
    SkillItemUpdate,
    SkillReorderItem,
)


def _reindex_groups(db: Session) -> None:
    groups = db.query(SkillGroup).order_by(SkillGroup.display_order, SkillGroup.id).all()
    for index, group in enumerate(groups):
        group.display_order = index


def _reindex_items(db: Session, skill_group_id: int) -> None:
    items = db.query(SkillItem).filter(SkillItem.skill_group_id == skill_group_id).order_by(SkillItem.display_order, SkillItem.id).all()
    for index, item in enumerate(items):
        item.display_order = index


def get_skill_group(db: Session, group_id: int) -> SkillGroup | None:
    return db.query(SkillGroup).filter(SkillGroup.id == group_id).first()


def get_all_skill_groups(db: Session) -> list[SkillGroup]:
    return db.query(SkillGroup).order_by(SkillGroup.display_order, SkillGroup.id).all()


def create_skill_group(db: Session, data: SkillGroupCreate) -> SkillGroup:
    next_order = db.query(SkillGroup).count()
    group = SkillGroup(
        name=data.name,
        description=data.description,
        display_order=next_order,
    )
    db.add(group)
    db.flush()
    for index, item_data in enumerate(data.items):
        item = SkillItem(
            skill_group_id=group.id,
            name=item_data.name,
            level=item_data.level,
            display_order=index,
        )
        db.add(item)
    db.commit()
    db.refresh(group)
    return group


def update_skill_group(db: Session, group_id: int, data: SkillGroupUpdate) -> SkillGroup | None:
    group = get_skill_group(db, group_id)
    if group is None:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(group, field, value)
    db.commit()
    db.refresh(group)
    return group


def delete_skill_group(db: Session, group_id: int) -> bool:
    group = get_skill_group(db, group_id)
    if group is None:
        return False
    db.delete(group)
    db.flush()
    _reindex_groups(db)
    db.commit()
    return True


def reorder_skill_groups(db: Session, items: list[SkillReorderItem]) -> list[SkillGroup]:
    if not items:
        return get_all_skill_groups(db)
    item_map = {item.id: item.display_order for item in items}
    groups = db.query(SkillGroup).all()
    for group in groups:
        if group.id in item_map:
            group.display_order = item_map[group.id]
    db.flush()
    _reindex_groups(db)
    db.commit()
    return get_all_skill_groups(db)


def get_skill_item(db: Session, item_id: int) -> SkillItem | None:
    return db.query(SkillItem).filter(SkillItem.id == item_id).first()


def create_skill_item(db: Session, group_id: int, data: SkillItemCreate) -> SkillItem | None:
    group = get_skill_group(db, group_id)
    if group is None:
        return None
    next_order = db.query(SkillItem).filter(SkillItem.skill_group_id == group_id).count()
    item = SkillItem(
        skill_group_id=group_id,
        name=data.name,
        level=data.level,
        display_order=next_order,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_skill_item(db: Session, item_id: int, data: SkillItemUpdate) -> SkillItem | None:
    item = get_skill_item(db, item_id)
    if item is None:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


def delete_skill_item(db: Session, item_id: int) -> bool:
    item = get_skill_item(db, item_id)
    if item is None:
        return False
    group_id = item.skill_group_id
    db.delete(item)
    db.flush()
    _reindex_items(db, group_id)
    db.commit()
    return True


def reorder_skill_items(db: Session, group_id: int, items: list[SkillReorderItem]) -> list[SkillItem] | None:
    group = get_skill_group(db, group_id)
    if group is None:
        return None
    item_map = {item.id: item.display_order for item in items}
    group_items = db.query(SkillItem).filter(SkillItem.skill_group_id == group_id).all()
    for item in group_items:
        if item.id in item_map:
            item.display_order = item_map[item.id]
    db.flush()
    _reindex_items(db, group_id)
    db.commit()
    return db.query(SkillItem).filter(SkillItem.skill_group_id == group_id).order_by(SkillItem.display_order, SkillItem.id).all()
