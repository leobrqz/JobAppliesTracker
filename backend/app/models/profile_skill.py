from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy import ForeignKey, Integer, String, Text, func, text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class SkillGroup(Base):
    __tablename__ = "skill_group"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False, server_default=text("auth.uid()"), index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now(), onupdate=func.now())

    items: Mapped[list["SkillItem"]] = relationship(
        "SkillItem",
        back_populates="group",
        cascade="all, delete-orphan",
        order_by="SkillItem.display_order",
    )


class SkillItem(Base):
    __tablename__ = "skill_item"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False, server_default=text("auth.uid()"), index=True)
    skill_group_id: Mapped[int] = mapped_column(ForeignKey("skill_group.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    level: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now(), onupdate=func.now())

    group: Mapped["SkillGroup"] = relationship("SkillGroup", back_populates="items")
