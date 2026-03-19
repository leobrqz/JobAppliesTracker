from datetime import datetime
from typing import Optional

from sqlalchemy import ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Appointment(Base):
    __tablename__ = "appointment"

    id: Mapped[int] = mapped_column(primary_key=True)
    application_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("application.id", ondelete="CASCADE"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    platform: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    meeting_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    starts_at: Mapped[datetime] = mapped_column(nullable=False)
    ends_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now(), onupdate=func.now())

    application: Mapped[Optional["Application"]] = relationship("Application", back_populates="appointments")
