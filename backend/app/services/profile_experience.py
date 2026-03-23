from sqlalchemy.orm import Session

from app.models.profile_experience import ExperienceBullet, ExperienceEntry
from app.schemas.profile_experience import (
    ExperienceBulletCreate,
    ExperienceBulletUpdate,
    ExperienceEntryCreate,
    ExperienceEntryUpdate,
    ExperienceReorderItem,
)


def _reindex_entries(db: Session) -> None:
    entries = db.query(ExperienceEntry).order_by(ExperienceEntry.display_order, ExperienceEntry.id).all()
    for index, entry in enumerate(entries):
        entry.display_order = index


def _reindex_bullets(db: Session, experience_entry_id: int) -> None:
    bullets = (
        db.query(ExperienceBullet)
        .filter(ExperienceBullet.experience_entry_id == experience_entry_id)
        .order_by(ExperienceBullet.display_order, ExperienceBullet.id)
        .all()
    )
    for index, bullet in enumerate(bullets):
        bullet.display_order = index


def get_experience_entry(db: Session, entry_id: int) -> ExperienceEntry | None:
    return db.query(ExperienceEntry).filter(ExperienceEntry.id == entry_id).first()


def get_all_experience_entries(db: Session) -> list[ExperienceEntry]:
    return db.query(ExperienceEntry).order_by(ExperienceEntry.display_order, ExperienceEntry.id).all()


def create_experience_entry(db: Session, data: ExperienceEntryCreate) -> ExperienceEntry:
    next_order = db.query(ExperienceEntry).count()
    entry = ExperienceEntry(
        job_title=data.job_title,
        company=data.company,
        start_date=data.start_date,
        end_date=data.end_date,
        is_current=data.is_current,
        seniority=data.seniority,
        compensation_amount=data.compensation_amount,
        compensation_currency=data.compensation_currency,
        compensation_period=data.compensation_period,
        summary=data.summary,
        display_order=next_order,
    )
    db.add(entry)
    db.flush()
    for index, bullet_data in enumerate(data.bullets):
        bullet = ExperienceBullet(
            experience_entry_id=entry.id,
            content=bullet_data.content,
            display_order=index,
        )
        db.add(bullet)
    db.commit()
    db.refresh(entry)
    return entry


def update_experience_entry(db: Session, entry_id: int, data: ExperienceEntryUpdate) -> ExperienceEntry | None:
    entry = get_experience_entry(db, entry_id)
    if entry is None:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)
    db.commit()
    db.refresh(entry)
    return entry


def delete_experience_entry(db: Session, entry_id: int) -> bool:
    entry = get_experience_entry(db, entry_id)
    if entry is None:
        return False
    db.delete(entry)
    db.flush()
    _reindex_entries(db)
    db.commit()
    return True


def reorder_experience_entries(db: Session, items: list[ExperienceReorderItem]) -> list[ExperienceEntry]:
    if not items:
        return get_all_experience_entries(db)
    item_map = {item.id: item.display_order for item in items}
    entries = db.query(ExperienceEntry).all()
    for entry in entries:
        if entry.id in item_map:
            entry.display_order = item_map[entry.id]
    db.flush()
    _reindex_entries(db)
    db.commit()
    return get_all_experience_entries(db)


def get_experience_bullet(db: Session, bullet_id: int) -> ExperienceBullet | None:
    return db.query(ExperienceBullet).filter(ExperienceBullet.id == bullet_id).first()


def create_experience_bullet(db: Session, entry_id: int, data: ExperienceBulletCreate) -> ExperienceBullet | None:
    entry = get_experience_entry(db, entry_id)
    if entry is None:
        return None
    next_order = db.query(ExperienceBullet).filter(ExperienceBullet.experience_entry_id == entry_id).count()
    bullet = ExperienceBullet(experience_entry_id=entry_id, content=data.content, display_order=next_order)
    db.add(bullet)
    db.commit()
    db.refresh(bullet)
    return bullet


def update_experience_bullet(db: Session, bullet_id: int, data: ExperienceBulletUpdate) -> ExperienceBullet | None:
    bullet = get_experience_bullet(db, bullet_id)
    if bullet is None:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(bullet, field, value)
    db.commit()
    db.refresh(bullet)
    return bullet


def delete_experience_bullet(db: Session, bullet_id: int) -> bool:
    bullet = get_experience_bullet(db, bullet_id)
    if bullet is None:
        return False
    entry_id = bullet.experience_entry_id
    db.delete(bullet)
    db.flush()
    _reindex_bullets(db, entry_id)
    db.commit()
    return True


def reorder_experience_bullets(
    db: Session,
    entry_id: int,
    items: list[ExperienceReorderItem],
) -> list[ExperienceBullet] | None:
    entry = get_experience_entry(db, entry_id)
    if entry is None:
        return None
    item_map = {item.id: item.display_order for item in items}
    bullets = db.query(ExperienceBullet).filter(ExperienceBullet.experience_entry_id == entry_id).all()
    for bullet in bullets:
        if bullet.id in item_map:
            bullet.display_order = item_map[bullet.id]
    db.flush()
    _reindex_bullets(db, entry_id)
    db.commit()
    return (
        db.query(ExperienceBullet)
        .filter(ExperienceBullet.experience_entry_id == entry_id)
        .order_by(ExperienceBullet.display_order, ExperienceBullet.id)
        .all()
    )
