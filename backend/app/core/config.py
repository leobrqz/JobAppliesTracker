from typing import Literal

from pydantic import field_validator
from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_ENV: Literal["development", "staging", "production"] = "development"
    DATABASE_URL: str
    STORAGE_DIR: str = "./storage"
    CORS_ORIGINS: str = "http://localhost:3000"
    SUPABASE_URL: str | None = None
    SUPABASE_ANON_KEY: str | None = None
    SUPABASE_SERVICE_ROLE_KEY: str | None = None
    SUPABASE_STORAGE_BUCKET: str = "jobtracker"
    SUPABASE_JWT_SECRET: str | None = None
    SUPABASE_JWT_VERIFICATION_MODE: Literal["hs256", "jwks"] = "hs256"
    SUPABASE_JWT_AUDIENCE: str = "authenticated"
    SUPABASE_JWT_ISSUER: str | None = None
    AUTH_PUBLIC_PATHS: str = "/,/healthz,/openapi.json,/docs,/docs/oauth2-redirect,/redoc"

    @field_validator(
        "SUPABASE_URL",
        "SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
        "SUPABASE_JWT_SECRET",
        "SUPABASE_JWT_ISSUER",
        mode="before",
    )
    @classmethod
    def empty_str_to_none(cls, v: str | None) -> str | None:
        if v is None:
            return None
        if isinstance(v, str) and not v.strip():
            return None
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8-sig",
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def auth_public_paths_list(self) -> list[str]:
        return [o.strip() for o in self.AUTH_PUBLIC_PATHS.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

    @model_validator(mode="after")
    def validate_auth_settings(self) -> "Settings":
        if self.SUPABASE_JWT_VERIFICATION_MODE == "hs256" and not self.SUPABASE_JWT_SECRET:
            raise ValueError("SUPABASE_JWT_SECRET is required when SUPABASE_JWT_VERIFICATION_MODE=hs256")
        if self.SUPABASE_JWT_VERIFICATION_MODE == "jwks" and not self.SUPABASE_URL:
            raise ValueError("SUPABASE_URL is required when SUPABASE_JWT_VERIFICATION_MODE=jwks")
        if self.is_production and not self.SUPABASE_JWT_ISSUER:
            raise ValueError("SUPABASE_JWT_ISSUER is required when APP_ENV=production")
        return self


settings = Settings()
