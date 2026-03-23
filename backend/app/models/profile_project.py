from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ProjectEntry(Base):
    __tablename__ = "project_entry"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    repository_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    is_current: Mapped[bool] = mapped_column(nullable=False, server_default="false")
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now(), onupdate=func.now())

    bullets: Mapped[list["ProjectBullet"]] = relationship(
        "ProjectBullet",
        back_populates="entry",
        cascade="all, delete-orphan",
        order_by="ProjectBullet.display_order",
    )


class ProjectBullet(Base):
    __tablename__ = "project_bullet"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_entry_id: Mapped[int] = mapped_column(
        ForeignKey("project_entry.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now(), onupdate=func.now())

    entry: Mapped["ProjectEntry"] = relationship("ProjectEntry", back_populates="bullets")
