from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Application(Base):
    __tablename__ = "application"

    id: Mapped[int] = mapped_column(primary_key=True)
    platform_id: Mapped[int] = mapped_column(ForeignKey("job_platform.id", ondelete="RESTRICT"), nullable=False)
    job_title: Mapped[str] = mapped_column(String(255), nullable=False)
    company: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    salary: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    seniority: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    contract_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    application_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    current_stage: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    applied_at: Mapped[datetime] = mapped_column(nullable=False)
    resume_id: Mapped[Optional[int]] = mapped_column(ForeignKey("resume.id", ondelete="SET NULL"), nullable=True)
    company_id: Mapped[Optional[int]] = mapped_column(ForeignKey("company.id", ondelete="SET NULL"), nullable=True)
    archived_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now(), onupdate=func.now())

    platform: Mapped["JobPlatform"] = relationship("JobPlatform", back_populates="applications")
    resume: Mapped[Optional["Resume"]] = relationship("Resume", back_populates="applications")
    company_ref: Mapped[Optional["Company"]] = relationship("Company", back_populates="applications")
    history: Mapped[list["ApplicationHistory"]] = relationship(
        "ApplicationHistory",
        back_populates="application",
        cascade="all, delete-orphan",
    )
    appointments: Mapped[list["Appointment"]] = relationship(
        "Appointment",
        back_populates="application",
        cascade="all, delete-orphan",
    )
