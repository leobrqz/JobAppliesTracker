from sqlalchemy.orm import Session

from app.core.request_context import require_current_user_id
from app.models.profile_about_me import ProfileAboutMe
from app.schemas.profile_about_me import ProfileAboutMeUpdate


def get_about_me(db: Session) -> ProfileAboutMe:
    user_id = require_current_user_id()
    entry = db.query(ProfileAboutMe).filter(ProfileAboutMe.user_id == user_id).first()
    if entry is None:
        entry = ProfileAboutMe(description="", user_id=user_id)
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
