from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.platform_template import PlatformTemplateResponse
from app.services import platform_template as platform_template_service

router = APIRouter(prefix="/api/platform-templates", tags=["platform-templates"])


@router.get("/", response_model=list[PlatformTemplateResponse])
def list_platform_templates(db: Session = Depends(get_db)) -> list[PlatformTemplateResponse]:
    return platform_template_service.get_platform_templates(db)
