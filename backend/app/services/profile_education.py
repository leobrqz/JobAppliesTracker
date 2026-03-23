from sqlalchemy.orm import Session

from app.models.profile_education import EducationEntry, EducationHighlight
from app.schemas.profile_education import (
    EducationEntryCreate,
    EducationEntryUpdate,
    EducationHighlightCreate,
    EducationHighlightUpdate,
    EducationReorderItem,
)


def _reindex_entries(db: Session) -> None:
    entries = db.query(EducationEntry).order_by(EducationEntry.display_order, EducationEntry.id).all()
    for index, entry in enumerate(entries):
        entry.display_order = index


def _reindex_highlights(db: Session, education_entry_id: int) -> None:
    highlights = (
        db.query(EducationHighlight)
        .filter(EducationHighlight.education_entry_id == education_entry_id)
        .order_by(EducationHighlight.display_order, EducationHighlight.id)
        .all()
    )
    for index, highlight in enumerate(highlights):
        highlight.display_order = index


def get_education_entry(db: Session, entry_id: int) -> EducationEntry | None:
    return db.query(EducationEntry).filter(EducationEntry.id == entry_id).first()


def get_all_education_entries(db: Session) -> list[EducationEntry]:
    return db.query(EducationEntry).order_by(EducationEntry.display_order, EducationEntry.id).all()


def create_education_entry(db: Session, data: EducationEntryCreate) -> EducationEntry:
    next_order = db.query(EducationEntry).count()
    entry = EducationEntry(
        institution=data.institution,
        degree=data.degree,
        field_of_study=data.field_of_study,
        start_date=data.start_date,
        end_date=data.end_date,
        is_current=data.is_current,
        description=data.description,
        display_order=next_order,
    )
    db.add(entry)
    db.flush()
    for index, highlight_data in enumerate(data.highlights):
        highlight = EducationHighlight(
            education_entry_id=entry.id,
            content=highlight_data.content,
            display_order=index,
        )
        db.add(highlight)
    db.commit()
    db.refresh(entry)
    return entry


def update_education_entry(db: Session, entry_id: int, data: EducationEntryUpdate) -> EducationEntry | None:
    entry = get_education_entry(db, entry_id)
    if entry is None:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)
    db.commit()
    db.refresh(entry)
    return entry


def delete_education_entry(db: Session, entry_id: int) -> bool:
    entry = get_education_entry(db, entry_id)
    if entry is None:
        return False
    db.delete(entry)
    db.flush()
    _reindex_entries(db)
    db.commit()
    return True


def reorder_education_entries(db: Session, items: list[EducationReorderItem]) -> list[EducationEntry]:
    if not items:
        return get_all_education_entries(db)
    item_map = {item.id: item.display_order for item in items}
    entries = db.query(EducationEntry).all()
    for entry in entries:
        if entry.id in item_map:
            entry.display_order = item_map[entry.id]
    db.flush()
    _reindex_entries(db)
    db.commit()
    return get_all_education_entries(db)


def get_education_highlight(db: Session, highlight_id: int) -> EducationHighlight | None:
    return db.query(EducationHighlight).filter(EducationHighlight.id == highlight_id).first()


def create_education_highlight(
    db: Session,
    entry_id: int,
    data: EducationHighlightCreate,
) -> EducationHighlight | None:
    entry = get_education_entry(db, entry_id)
    if entry is None:
        return None
    next_order = db.query(EducationHighlight).filter(EducationHighlight.education_entry_id == entry_id).count()
    highlight = EducationHighlight(education_entry_id=entry_id, content=data.content, display_order=next_order)
    db.add(highlight)
    db.commit()
    db.refresh(highlight)
    return highlight


def update_education_highlight(
    db: Session,
    highlight_id: int,
    data: EducationHighlightUpdate,
) -> EducationHighlight | None:
    highlight = get_education_highlight(db, highlight_id)
    if highlight is None:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(highlight, field, value)
    db.commit()
    db.refresh(highlight)
    return highlight


def delete_education_highlight(db: Session, highlight_id: int) -> bool:
    highlight = get_education_highlight(db, highlight_id)
    if highlight is None:
        return False
    entry_id = highlight.education_entry_id
    db.delete(highlight)
    db.flush()
    _reindex_highlights(db, entry_id)
    db.commit()
    return True


def reorder_education_highlights(
    db: Session,
    entry_id: int,
    items: list[EducationReorderItem],
) -> list[EducationHighlight] | None:
    entry = get_education_entry(db, entry_id)
    if entry is None:
        return None
    item_map = {item.id: item.display_order for item in items}
    highlights = db.query(EducationHighlight).filter(EducationHighlight.education_entry_id == entry_id).all()
    for highlight in highlights:
        if highlight.id in item_map:
            highlight.display_order = item_map[highlight.id]
    db.flush()
    _reindex_highlights(db, entry_id)
    db.commit()
    return (
        db.query(EducationHighlight)
        .filter(EducationHighlight.education_entry_id == entry_id)
        .order_by(EducationHighlight.display_order, EducationHighlight.id)
        .all()
    )
