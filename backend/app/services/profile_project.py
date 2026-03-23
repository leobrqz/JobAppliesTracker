from sqlalchemy.orm import Session

from app.models.profile_project import ProjectBullet, ProjectEntry
from app.schemas.profile_project import (
    ProjectBulletCreate,
    ProjectBulletUpdate,
    ProjectEntryCreate,
    ProjectEntryUpdate,
    ProjectReorderItem,
)


def _reindex_entries(db: Session) -> None:
    entries = db.query(ProjectEntry).order_by(ProjectEntry.display_order, ProjectEntry.id).all()
    for index, entry in enumerate(entries):
        entry.display_order = index


def _reindex_bullets(db: Session, project_entry_id: int) -> None:
    bullets = (
        db.query(ProjectBullet)
        .filter(ProjectBullet.project_entry_id == project_entry_id)
        .order_by(ProjectBullet.display_order, ProjectBullet.id)
        .all()
    )
    for index, bullet in enumerate(bullets):
        bullet.display_order = index


def get_project_entry(db: Session, entry_id: int) -> ProjectEntry | None:
    return db.query(ProjectEntry).filter(ProjectEntry.id == entry_id).first()


def get_all_project_entries(db: Session) -> list[ProjectEntry]:
    return db.query(ProjectEntry).order_by(ProjectEntry.display_order, ProjectEntry.id).all()


def create_project_entry(db: Session, data: ProjectEntryCreate) -> ProjectEntry:
    next_order = db.query(ProjectEntry).count()
    entry = ProjectEntry(
        name=data.name,
        role=data.role,
        url=str(data.url) if data.url else None,
        repository_url=str(data.repository_url) if data.repository_url else None,
        start_date=data.start_date,
        end_date=data.end_date,
        is_current=data.is_current,
        description=data.description,
        display_order=next_order,
    )
    db.add(entry)
    db.flush()
    for index, bullet_data in enumerate(data.bullets):
        bullet = ProjectBullet(
            project_entry_id=entry.id,
            content=bullet_data.content,
            display_order=index,
        )
        db.add(bullet)
    db.commit()
    db.refresh(entry)
    return entry


def update_project_entry(db: Session, entry_id: int, data: ProjectEntryUpdate) -> ProjectEntry | None:
    entry = get_project_entry(db, entry_id)
    if entry is None:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        if field in {"url", "repository_url"} and value is not None:
            value = str(value)
        setattr(entry, field, value)
    db.commit()
    db.refresh(entry)
    return entry


def delete_project_entry(db: Session, entry_id: int) -> bool:
    entry = get_project_entry(db, entry_id)
    if entry is None:
        return False
    db.delete(entry)
    db.flush()
    _reindex_entries(db)
    db.commit()
    return True


def reorder_project_entries(db: Session, items: list[ProjectReorderItem]) -> list[ProjectEntry]:
    if not items:
        return get_all_project_entries(db)
    item_map = {item.id: item.display_order for item in items}
    entries = db.query(ProjectEntry).all()
    for entry in entries:
        if entry.id in item_map:
            entry.display_order = item_map[entry.id]
    db.flush()
    _reindex_entries(db)
    db.commit()
    return get_all_project_entries(db)


def get_project_bullet(db: Session, bullet_id: int) -> ProjectBullet | None:
    return db.query(ProjectBullet).filter(ProjectBullet.id == bullet_id).first()


def create_project_bullet(db: Session, entry_id: int, data: ProjectBulletCreate) -> ProjectBullet | None:
    entry = get_project_entry(db, entry_id)
    if entry is None:
        return None
    next_order = db.query(ProjectBullet).filter(ProjectBullet.project_entry_id == entry_id).count()
    bullet = ProjectBullet(project_entry_id=entry_id, content=data.content, display_order=next_order)
    db.add(bullet)
    db.commit()
    db.refresh(bullet)
    return bullet


def update_project_bullet(db: Session, bullet_id: int, data: ProjectBulletUpdate) -> ProjectBullet | None:
    bullet = get_project_bullet(db, bullet_id)
    if bullet is None:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(bullet, field, value)
    db.commit()
    db.refresh(bullet)
    return bullet


def delete_project_bullet(db: Session, bullet_id: int) -> bool:
    bullet = get_project_bullet(db, bullet_id)
    if bullet is None:
        return False
    entry_id = bullet.project_entry_id
    db.delete(bullet)
    db.flush()
    _reindex_bullets(db, entry_id)
    db.commit()
    return True


def reorder_project_bullets(
    db: Session,
    entry_id: int,
    items: list[ProjectReorderItem],
) -> list[ProjectBullet] | None:
    entry = get_project_entry(db, entry_id)
    if entry is None:
        return None
    item_map = {item.id: item.display_order for item in items}
    bullets = db.query(ProjectBullet).filter(ProjectBullet.project_entry_id == entry_id).all()
    for bullet in bullets:
        if bullet.id in item_map:
            bullet.display_order = item_map[bullet.id]
    db.flush()
    _reindex_bullets(db, entry_id)
    db.commit()
    return (
        db.query(ProjectBullet)
        .filter(ProjectBullet.project_entry_id == entry_id)
        .order_by(ProjectBullet.display_order, ProjectBullet.id)
        .all()
    )
