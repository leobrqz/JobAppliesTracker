import re
from datetime import date, datetime
from decimal import Decimal
from typing import Any, Optional

from pydantic import BaseModel, field_validator, model_validator

CompensationPeriod = str


def _normalize_optional_str(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    normalized = value.strip()
    return normalized or None


def _normalize_required_str(value: str) -> str:
    normalized = value.strip()
    if normalized == "":
        raise ValueError("value cannot be empty")
    return normalized


class ExperienceBulletCreate(BaseModel):
    content: str

    @field_validator("content")
    @classmethod
    def validate_content(cls, value: str) -> str:
        return _normalize_required_str(value)


class ExperienceBulletUpdate(BaseModel):
    content: Optional[str] = None

    @field_validator("content")
    @classmethod
    def validate_content(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        return _normalize_required_str(value)


class ExperienceBulletResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    experience_entry_id: int
    content: str
    display_order: int
    created_at: datetime
    updated_at: datetime


class ExperienceEntryCreate(BaseModel):
    job_title: str
    company: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: bool = False
    seniority: Optional[str] = None
    compensation_amount: Optional[Decimal] = None
    compensation_currency: Optional[str] = None
    compensation_period: Optional[CompensationPeriod] = None
    summary: Optional[str] = None
    bullets: list[ExperienceBulletCreate] = []

    @field_validator("job_title", "company")
    @classmethod
    def validate_required_fields(cls, value: str) -> str:
        return _normalize_required_str(value)

    @field_validator("seniority", "summary", mode="before")
    @classmethod
    def validate_optional_fields(cls, value: Optional[str]) -> Optional[str]:
        return _normalize_optional_str(value)

    @field_validator("compensation_currency", mode="before")
    @classmethod
    def normalize_currency(cls, value: Optional[str]) -> Optional[str]:
        if value is None or value == "":
            return None
        normalized = str(value).strip().upper()
        if not re.fullmatch(r"[A-Z]{3}", normalized):
            raise ValueError("compensation_currency must be a 3-letter ISO 4217 code")
        return normalized

    @model_validator(mode="after")
    def validate_dates_and_compensation(self) -> "ExperienceEntryCreate":
        if self.is_current and self.end_date is not None:
            raise ValueError("end_date must be null when is_current is true")
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("end_date must be greater than or equal to start_date")
        if self.compensation_amount is None:
            self.compensation_currency = None
            self.compensation_period = None
        elif self.compensation_currency is None or self.compensation_period is None:
            raise ValueError("compensation_currency and compensation_period are required when compensation_amount is set")
        return self


class ExperienceEntryUpdate(BaseModel):
    job_title: Optional[str] = None
    company: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: Optional[bool] = None
    seniority: Optional[str] = None
    compensation_amount: Optional[Decimal] = None
    compensation_currency: Optional[str] = None
    compensation_period: Optional[CompensationPeriod] = None
    summary: Optional[str] = None

    @field_validator("job_title", "company")
    @classmethod
    def validate_required_fields(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        return _normalize_required_str(value)

    @field_validator("seniority", "summary", mode="before")
    @classmethod
    def validate_optional_fields(cls, value: Optional[str]) -> Optional[str]:
        return _normalize_optional_str(value)

    @field_validator("compensation_currency", mode="before")
    @classmethod
    def normalize_currency(cls, value: Optional[str]) -> Optional[str]:
        if value is None or value == "":
            return None
        normalized = str(value).strip().upper()
        if not re.fullmatch(r"[A-Z]{3}", normalized):
            raise ValueError("compensation_currency must be a 3-letter ISO 4217 code")
        return normalized

    @model_validator(mode="before")
    @classmethod
    def validate_patch(cls, data: Any) -> Any:
        if not isinstance(data, dict):
            return data
        if data.get("is_current") is True and data.get("end_date") is not None:
            raise ValueError("end_date must be null when is_current is true")
        if "compensation_amount" in data and data["compensation_amount"] is not None:
            if data.get("compensation_currency") is None or data.get("compensation_period") is None:
                raise ValueError("compensation_currency and compensation_period are required when compensation_amount is set")
        return data


class ExperienceEntryResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    job_title: str
    company: str
    start_date: Optional[date]
    end_date: Optional[date]
    is_current: bool
    seniority: Optional[str]
    compensation_amount: Optional[Decimal]
    compensation_currency: Optional[str]
    compensation_period: Optional[str]
    summary: Optional[str]
    display_order: int
    bullets: list[ExperienceBulletResponse]
    created_at: datetime
    updated_at: datetime


class ExperienceReorderItem(BaseModel):
    id: int
    display_order: int
