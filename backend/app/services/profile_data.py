from sqlalchemy.orm import Session

from app.models.profile_data import ProfileData
from app.schemas.profile_data import ProfileDataCreate, ProfileDataUpdate


def get_profile_data(db: Session, profile_data_id: int) -> ProfileData | None:
    return db.query(ProfileData).filter(ProfileData.id == profile_data_id).first()


def get_all_profile_data(db: Session) -> list[ProfileData]:
    return db.query(ProfileData).order_by(ProfileData.created_at).all()


def create_profile_data(db: Session, data: ProfileDataCreate) -> ProfileData:
    entry = ProfileData(
        label=data.label,
        value=data.value,
        type=data.type,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def update_profile_data(db: Session, profile_data_id: int, data: ProfileDataUpdate) -> ProfileData | None:
    entry = get_profile_data(db, profile_data_id)
    if entry is None:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)
    db.commit()
    db.refresh(entry)
    return entry


def delete_profile_data(db: Session, profile_data_id: int) -> bool:
    entry = get_profile_data(db, profile_data_id)
    if entry is None:
        return False
    db.delete(entry)
    db.commit()
    return True
