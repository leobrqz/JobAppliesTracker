from datetime import datetime

from pydantic import BaseModel, field_validator


class ProfileAboutMeUpdate(BaseModel):
    description: str

    @field_validator("description")
    @classmethod
    def normalize_description(cls, value: str) -> str:
        return value.strip()


class ProfileAboutMeResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    description: str
    created_at: datetime
    updated_at: datetime
