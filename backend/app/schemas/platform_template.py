from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class PlatformTemplateResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    name: str
    icon: Optional[str]
    base_url: Optional[str]
    applications_url: Optional[str]
    created_at: datetime
