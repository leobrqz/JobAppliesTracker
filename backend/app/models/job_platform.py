from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy import Boolean, String, UniqueConstraint, func, text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class JobPlatform(Base):
    __tablename__ = "job_platform"
    __table_args__ = (UniqueConstraint("user_id", "id", name="uq_job_platform_user_id_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False, server_default=text("auth.uid()"), index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    icon: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    base_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    applications_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    registered_at: Mapped[datetime] = mapped_column(nullable=False)
    manual_resume: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now(), onupdate=func.now())

    applications: Mapped[list["Application"]] = relationship("Application", back_populates="platform")
