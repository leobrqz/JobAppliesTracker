from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ApplicationHistoryCreate(BaseModel):
    stage: str
    date: datetime
    notes: Optional[str] = None


class ApplicationHistoryResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    application_id: int
    stage: str
    date: datetime
    notes: Optional[str]
    created_at: datetime
