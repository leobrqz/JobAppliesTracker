from datetime import date, datetime
from typing import Any, Optional

from pydantic import BaseModel, field_validator, model_validator


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


class EducationHighlightCreate(BaseModel):
    content: str

    @field_validator("content")
    @classmethod
    def validate_content(cls, value: str) -> str:
        return _normalize_required_str(value)


class EducationHighlightUpdate(BaseModel):
    content: Optional[str] = None

    @field_validator("content")
    @classmethod
    def validate_content(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        return _normalize_required_str(value)


class EducationHighlightResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    education_entry_id: int
    content: str
    display_order: int
    created_at: datetime
    updated_at: datetime


class EducationEntryCreate(BaseModel):
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: bool = False
    description: Optional[str] = None
    highlights: list[EducationHighlightCreate] = []

    @field_validator("institution", "degree")
    @classmethod
    def validate_required_fields(cls, value: str) -> str:
        return _normalize_required_str(value)

    @field_validator("field_of_study", "description", mode="before")
    @classmethod
    def validate_optional_fields(cls, value: Optional[str]) -> Optional[str]:
        return _normalize_optional_str(value)

    @model_validator(mode="after")
    def validate_dates(self) -> "EducationEntryCreate":
        if self.is_current and self.end_date is not None:
            raise ValueError("end_date must be null when is_current is true")
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("end_date must be greater than or equal to start_date")
        return self


class EducationEntryUpdate(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: Optional[bool] = None
    description: Optional[str] = None

    @field_validator("institution", "degree")
    @classmethod
    def validate_required_fields(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        return _normalize_required_str(value)

    @field_validator("field_of_study", "description", mode="before")
    @classmethod
    def validate_optional_fields(cls, value: Optional[str]) -> Optional[str]:
        return _normalize_optional_str(value)

    @model_validator(mode="before")
    @classmethod
    def validate_patch_dates(cls, data: Any) -> Any:
        if not isinstance(data, dict):
            return data
        if data.get("is_current") is True and data.get("end_date") is not None:
            raise ValueError("end_date must be null when is_current is true")
        if data.get("start_date") and data.get("end_date") and data["end_date"] < data["start_date"]:
            raise ValueError("end_date must be greater than or equal to start_date")
        return data


class EducationEntryResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    institution: str
    degree: str
    field_of_study: Optional[str]
    start_date: Optional[date]
    end_date: Optional[date]
    is_current: bool
    description: Optional[str]
    display_order: int
    highlights: list[EducationHighlightResponse]
    created_at: datetime
    updated_at: datetime


class EducationReorderItem(BaseModel):
    id: int
    display_order: int
