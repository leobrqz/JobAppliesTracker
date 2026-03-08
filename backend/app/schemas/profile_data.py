from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ProfileDataCreate(BaseModel):
    label: str
    value: str
    type: str


class ProfileDataUpdate(BaseModel):
    label: Optional[str] = None
    value: Optional[str] = None
    type: Optional[str] = None


class ProfileDataResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    label: str
    value: str
    type: str
    created_at: datetime
    updated_at: datetime
