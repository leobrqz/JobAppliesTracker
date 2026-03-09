from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class CompanyCreate(BaseModel):
    name: str
    website: Optional[str] = None
    notes: Optional[str] = None


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    website: Optional[str] = None
    notes: Optional[str] = None


class CompanyResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    name: str
    website: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
