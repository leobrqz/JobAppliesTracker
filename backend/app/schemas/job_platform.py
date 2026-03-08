from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class JobPlatformCreate(BaseModel):
    name: str
    icon: Optional[str] = None
    base_url: Optional[str] = None
    applications_url: Optional[str] = None
    registered_at: datetime
    manual_resume: bool = False


class JobPlatformUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    base_url: Optional[str] = None
    applications_url: Optional[str] = None
    registered_at: Optional[datetime] = None
    manual_resume: Optional[bool] = None


class JobPlatformResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    name: str
    icon: Optional[str]
    base_url: Optional[str]
    applications_url: Optional[str]
    registered_at: datetime
    manual_resume: bool
    created_at: datetime
    updated_at: datetime
