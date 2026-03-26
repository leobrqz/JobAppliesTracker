from datetime import date, datetime
from typing import Optional
from uuid import UUID

from sqlalchemy import Date, ForeignKeyConstraint, Integer, String, Text, UniqueConstraint, func, text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ProjectEntry(Base):
    __tablename__ = "project_entry"
    __table_args__ = (UniqueConstraint("user_id", "id", name="uq_project_entry_user_id_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False, server_default=text("auth.uid()"), index=True)
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
    __table_args__ = (
        ForeignKeyConstraint(
            ["user_id", "project_entry_id"],
            ["project_entry.user_id", "project_entry.id"],
            ondelete="CASCADE",
            name="fk_project_bullet_entry_user",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False, server_default=text("auth.uid()"), index=True)
    project_entry_id: Mapped[int] = mapped_column(nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now(), onupdate=func.now())

    entry: Mapped["ProjectEntry"] = relationship("ProjectEntry", back_populates="bullets")
