from sqlalchemy.orm import Session

from app.models.profile_about_me import ProfileAboutMe
from app.schemas.profile_about_me import ProfileAboutMeUpdate


def get_about_me(db: Session) -> ProfileAboutMe:
    entry = db.query(ProfileAboutMe).filter(ProfileAboutMe.id == 1).first()
    if entry is None:
        entry = ProfileAboutMe(id=1, description="")
        db.add(entry)
        db.commit()
        db.refresh(entry)
    return entry


def update_about_me(db: Session, data: ProfileAboutMeUpdate) -> ProfileAboutMe:
    entry = get_about_me(db)
    entry.description = data.description
    db.commit()
    db.refresh(entry)
    return entry
