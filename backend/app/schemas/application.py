from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class ApplicationCreate(BaseModel):
    platform_id: int
    job_title: str
    company: Optional[str] = None
    salary: Optional[Decimal] = None
    seniority: Optional[str] = None
    contract_type: Optional[str] = None
    application_url: Optional[str] = None
    current_stage: str
    status: str
    applied_at: date
    resume_id: Optional[int] = None


class ApplicationUpdate(BaseModel):
    platform_id: Optional[int] = None
    job_title: Optional[str] = None
    company: Optional[str] = None
    salary: Optional[Decimal] = None
    seniority: Optional[str] = None
    contract_type: Optional[str] = None
    application_url: Optional[str] = None
    status: Optional[str] = None
    applied_at: Optional[date] = None
    resume_id: Optional[int] = None


class ApplicationResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    platform_id: int
    job_title: str
    company: Optional[str]
    salary: Optional[Decimal]
    seniority: Optional[str]
    contract_type: Optional[str]
    application_url: Optional[str]
    current_stage: str
    status: str
    applied_at: datetime
    resume_id: Optional[int]
    archived_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
