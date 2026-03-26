from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from sqlalchemy import ForeignKeyConstraint, Numeric, String, UniqueConstraint, func, text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Application(Base):
    __tablename__ = "application"
    __table_args__ = (
        UniqueConstraint("user_id", "id", name="uq_application_user_id_id"),
        ForeignKeyConstraint(
            ["user_id", "platform_id"],
            ["job_platform.user_id", "job_platform.id"],
            ondelete="RESTRICT",
            name="fk_application_platform_user",
        ),
        ForeignKeyConstraint(
            ["user_id", "resume_id"],
            ["resume.user_id", "resume.id"],
            ondelete="SET NULL",
            name="fk_application_resume_user",
        ),
        ForeignKeyConstraint(
            ["user_id", "company_id"],
            ["company.user_id", "company.id"],
            ondelete="SET NULL",
            name="fk_application_company_user",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False, server_default=text("auth.uid()"), index=True)
    platform_id: Mapped[int] = mapped_column(nullable=False)
    job_title: Mapped[str] = mapped_column(String(255), nullable=False)
    company: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    salary: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    salary_currency: Mapped[Optional[str]] = mapped_column(String(3), nullable=True)
    pay_period: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    seniority: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    contract_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    application_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    current_stage: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    applied_at: Mapped[datetime] = mapped_column(nullable=False)
    resume_id: Mapped[Optional[int]] = mapped_column(nullable=True)
    company_id: Mapped[Optional[int]] = mapped_column(nullable=True)
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
