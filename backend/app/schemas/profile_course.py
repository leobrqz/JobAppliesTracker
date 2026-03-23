from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, HttpUrl, field_validator


def _normalize_optional(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    value = value.strip()
    return value or None


def _normalize_required(value: str) -> str:
    value = value.strip()
    if not value:
        raise ValueError("value cannot be empty")
    return value


class CourseEntryCreate(BaseModel):
    title: str
    provider: str
    completed_on: Optional[date] = None
    duration_hours: Optional[Decimal] = None
    verification_link: Optional[HttpUrl] = None
    notes: Optional[str] = None

    @field_validator("title", "provider")
    @classmethod
    def validate_required(cls, value: str) -> str:
        return _normalize_required(value)

    @field_validator("notes", mode="before")
    @classmethod
    def validate_optional(cls, value: Optional[str]) -> Optional[str]:
        return _normalize_optional(value)


class CourseEntryUpdate(BaseModel):
    title: Optional[str] = None
    provider: Optional[str] = None
    completed_on: Optional[date] = None
    duration_hours: Optional[Decimal] = None
    verification_link: Optional[HttpUrl] = None
    notes: Optional[str] = None

    @field_validator("title", "provider")
    @classmethod
    def validate_required(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        return _normalize_required(value)

    @field_validator("notes", mode="before")
    @classmethod
    def validate_optional(cls, value: Optional[str]) -> Optional[str]:
        return _normalize_optional(value)


class CourseEntryResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    title: str
    provider: str
    completed_on: Optional[date]
    duration_hours: Optional[Decimal]
    verification_link: Optional[str]
    attachment_file_name: Optional[str]
    attachment_mime_type: Optional[str]
    notes: Optional[str]
    display_order: int
    created_at: datetime
    updated_at: datetime


class CourseReorderItem(BaseModel):
    id: int
    display_order: int
