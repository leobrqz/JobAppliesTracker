from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy import ForeignKey, String, Text, func, text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ApplicationHistory(Base):
    __tablename__ = "application_history"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False, server_default=text("auth.uid()"), index=True)
    application_id: Mapped[int] = mapped_column(ForeignKey("application.id", ondelete="CASCADE"), nullable=False)
    stage: Mapped[str] = mapped_column(String(100), nullable=False)
    date: Mapped[datetime] = mapped_column(nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())

    application: Mapped["Application"] = relationship("Application", back_populates="history")
