from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy import ForeignKeyConstraint, Integer, String, Text, UniqueConstraint, func, text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class SkillGroup(Base):
    __tablename__ = "skill_group"
    __table_args__ = (UniqueConstraint("user_id", "id", name="uq_skill_group_user_id_id"),)

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
    __table_args__ = (
        ForeignKeyConstraint(
            ["user_id", "skill_group_id"],
            ["skill_group.user_id", "skill_group.id"],
            ondelete="CASCADE",
            name="fk_skill_item_group_user",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False, server_default=text("auth.uid()"), index=True)
    skill_group_id: Mapped[int] = mapped_column(nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    level: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now(), onupdate=func.now())

    group: Mapped["SkillGroup"] = relationship("SkillGroup", back_populates="items")
