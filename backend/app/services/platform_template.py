from sqlalchemy.orm import Session

from app.models.platform_template import PlatformTemplate


def get_platform_templates(db: Session) -> list[PlatformTemplate]:
    return db.query(PlatformTemplate).order_by(PlatformTemplate.name).all()
