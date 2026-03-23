from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, HttpUrl, field_validator, model_validator


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


class CertificationEntryCreate(BaseModel):
    name: str
    issuer: str
    issued_on: Optional[date] = None
    expires_on: Optional[date] = None
    credential_id: Optional[str] = None
    verification_link: Optional[HttpUrl] = None
    notes: Optional[str] = None

    @field_validator("name", "issuer")
    @classmethod
    def validate_required(cls, value: str) -> str:
        return _normalize_required(value)

    @field_validator("credential_id", "notes", mode="before")
    @classmethod
    def validate_optional(cls, value: Optional[str]) -> Optional[str]:
        return _normalize_optional(value)

    @model_validator(mode="after")
    def validate_dates(self) -> "CertificationEntryCreate":
        if self.issued_on and self.expires_on and self.expires_on < self.issued_on:
            raise ValueError("expires_on must be greater than or equal to issued_on")
        return self


class CertificationEntryUpdate(BaseModel):
    name: Optional[str] = None
    issuer: Optional[str] = None
    issued_on: Optional[date] = None
    expires_on: Optional[date] = None
    credential_id: Optional[str] = None
    verification_link: Optional[HttpUrl] = None
    notes: Optional[str] = None

    @field_validator("name", "issuer")
    @classmethod
    def validate_required(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        return _normalize_required(value)

    @field_validator("credential_id", "notes", mode="before")
    @classmethod
    def validate_optional(cls, value: Optional[str]) -> Optional[str]:
        return _normalize_optional(value)


class CertificationEntryResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    name: str
    issuer: str
    issued_on: Optional[date]
    expires_on: Optional[date]
    credential_id: Optional[str]
    verification_link: Optional[str]
    attachment_file_name: Optional[str]
    attachment_mime_type: Optional[str]
    notes: Optional[str]
    display_order: int
    created_at: datetime
    updated_at: datetime


class CertificationReorderItem(BaseModel):
    id: int
    display_order: int
