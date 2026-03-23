from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import Date, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ExperienceEntry(Base):
    __tablename__ = "experience_entry"

    id: Mapped[int] = mapped_column(primary_key=True)
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

    id: Mapped[int] = mapped_column(primary_key=True)
    experience_entry_id: Mapped[int] = mapped_column(
        ForeignKey("experience_entry.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now(), onupdate=func.now())

    entry: Mapped["ExperienceEntry"] = relationship("ExperienceEntry", back_populates="bullets")
