from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class AppointmentCreate(BaseModel):
    application_id: Optional[int] = None
    title: str
    type: str
    platform: Optional[str] = None
    meeting_url: Optional[str] = None
    starts_at: datetime
    ends_at: Optional[datetime] = None
    notes: Optional[str] = None


class AppointmentUpdate(BaseModel):
    application_id: Optional[int] = None
    title: Optional[str] = None
    type: Optional[str] = None
    platform: Optional[str] = None
    meeting_url: Optional[str] = None
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    notes: Optional[str] = None


class AppointmentResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    application_id: Optional[int]
    title: str
    type: str
    platform: Optional[str]
    meeting_url: Optional[str]
    starts_at: datetime
    ends_at: Optional[datetime]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
