from datetime import datetime
from typing import Optional

from pydantic import BaseModel, field_validator


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


class SkillItemCreate(BaseModel):
    name: str
    level: Optional[str] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        return _normalize_required_str(value)

    @field_validator("level", mode="before")
    @classmethod
    def validate_level(cls, value: Optional[str]) -> Optional[str]:
        return _normalize_optional_str(value)


class SkillItemUpdate(BaseModel):
    name: Optional[str] = None
    level: Optional[str] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        return _normalize_required_str(value)

    @field_validator("level", mode="before")
    @classmethod
    def validate_level(cls, value: Optional[str]) -> Optional[str]:
        return _normalize_optional_str(value)


class SkillItemResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    skill_group_id: int
    name: str
    level: Optional[str]
    display_order: int
    created_at: datetime
    updated_at: datetime


class SkillGroupCreate(BaseModel):
    name: str
    description: Optional[str] = None
    items: list[SkillItemCreate] = []

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        return _normalize_required_str(value)

    @field_validator("description", mode="before")
    @classmethod
    def validate_description(cls, value: Optional[str]) -> Optional[str]:
        return _normalize_optional_str(value)


class SkillGroupUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        return _normalize_required_str(value)

    @field_validator("description", mode="before")
    @classmethod
    def validate_description(cls, value: Optional[str]) -> Optional[str]:
        return _normalize_optional_str(value)


class SkillGroupResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    name: str
    description: Optional[str]
    display_order: int
    items: list[SkillItemResponse]
    created_at: datetime
    updated_at: datetime


class SkillReorderItem(BaseModel):
    id: int
    display_order: int
