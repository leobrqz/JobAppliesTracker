import re
from datetime import date, datetime
from decimal import Decimal
from typing import Any, Literal, Optional

from pydantic import BaseModel, field_validator, model_validator


PayPeriod = Literal["annual", "monthly", "hourly"]


class ApplicationCreate(BaseModel):
    platform_id: int
    job_title: str
    company: Optional[str] = None
    salary: Optional[Decimal] = None
    salary_currency: Optional[str] = None
    pay_period: Optional[PayPeriod] = None
    seniority: Optional[str] = None
    contract_type: Optional[str] = None
    application_url: Optional[str] = None
    current_stage: str
    status: str
    applied_at: date
    resume_id: Optional[int] = None
    company_id: Optional[int] = None

    @field_validator("salary_currency", mode="before")
    @classmethod
    def normalize_currency(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        s = str(v).strip().upper()
        if not re.fullmatch(r"[A-Z]{3}", s):
            raise ValueError("salary_currency must be a 3-letter ISO 4217 code")
        return s

    @model_validator(mode="after")
    def salary_coherence(self) -> "ApplicationCreate":
        if self.salary is None:
            self.salary_currency = None
            self.pay_period = None
        elif self.salary_currency is None or self.pay_period is None:
            raise ValueError("salary_currency and pay_period are required when salary is set")
        return self


class ApplicationUpdate(BaseModel):
    platform_id: Optional[int] = None
    job_title: Optional[str] = None
    company: Optional[str] = None
    salary: Optional[Decimal] = None
    salary_currency: Optional[str] = None
    pay_period: Optional[PayPeriod] = None
    seniority: Optional[str] = None
    contract_type: Optional[str] = None
    application_url: Optional[str] = None
    status: Optional[str] = None
    applied_at: Optional[date] = None
    resume_id: Optional[int] = None
    company_id: Optional[int] = None

    @field_validator("salary_currency", mode="before")
    @classmethod
    def normalize_currency_update(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        s = str(v).strip().upper()
        if not re.fullmatch(r"[A-Z]{3}", s):
            raise ValueError("salary_currency must be a 3-letter ISO 4217 code")
        return s

    @model_validator(mode="before")
    @classmethod
    def salary_coherence_on_patch(cls, data: Any) -> Any:
        if not isinstance(data, dict):
            return data
        if "salary" in data and data["salary"] is not None:
            if data.get("salary_currency") is None or data.get("pay_period") is None:
                raise ValueError("salary_currency and pay_period are required when salary is set")
        return data


class ApplicationResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    platform_id: int
    job_title: str
    company: Optional[str]
    company_id: Optional[int]
    salary: Optional[Decimal]
    salary_currency: Optional[str]
    pay_period: Optional[str]
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
