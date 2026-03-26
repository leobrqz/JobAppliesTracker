from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy import ForeignKeyConstraint, String, Text, func, text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ApplicationHistory(Base):
    __tablename__ = "application_history"
    __table_args__ = (
        ForeignKeyConstraint(
            ["user_id", "application_id"],
            ["application.user_id", "application.id"],
            ondelete="CASCADE",
            name="fk_application_history_application_user",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False, server_default=text("auth.uid()"), index=True)
    application_id: Mapped[int] = mapped_column(nullable=False)
    stage: Mapped[str] = mapped_column(String(100), nullable=False)
    date: Mapped[datetime] = mapped_column(nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())

    application: Mapped["Application"] = relationship("Application", back_populates="history")
