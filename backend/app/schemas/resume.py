from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ResumeCreate(BaseModel):
    name: str
    description: Optional[str] = None


class ResumeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class ResumeResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    name: str
    description: Optional[str]
    archived_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
