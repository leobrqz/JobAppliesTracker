from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from sqlalchemy import Date, ForeignKeyConstraint, Integer, Numeric, String, Text, UniqueConstraint, func, text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ExperienceEntry(Base):
    __tablename__ = "experience_entry"
    __table_args__ = (UniqueConstraint("user_id", "id", name="uq_experience_entry_user_id_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False, server_default=text("auth.uid()"), index=True)
    job_title: Mapped[str] = mapped_column(String(255), nullable=False)
    company: Mapped[str] = mapped_column(String(255), nullable=False)
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    is_current: Mapped[bool] = mapped_column(nullable=False, server_default="false")
    seniority: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    compensation_amount: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    compensation_currency: Mapped[Optional[str]] = mapped_column(String(3), nullable=True)
    compensation_period: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now(), onupdate=func.now())

    bullets: Mapped[list["ExperienceBullet"]] = relationship(
        "ExperienceBullet",
        back_populates="entry",
        cascade="all, delete-orphan",
        order_by="ExperienceBullet.display_order",
    )


class ExperienceBullet(Base):
    __tablename__ = "experience_bullet"
    __table_args__ = (
        ForeignKeyConstraint(
            ["user_id", "experience_entry_id"],
            ["experience_entry.user_id", "experience_entry.id"],
            ondelete="CASCADE",
            name="fk_experience_bullet_entry_user",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False, server_default=text("auth.uid()"), index=True)
    experience_entry_id: Mapped[int] = mapped_column(nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now(), onupdate=func.now())

    entry: Mapped["ExperienceEntry"] = relationship("ExperienceEntry", back_populates="bullets")
