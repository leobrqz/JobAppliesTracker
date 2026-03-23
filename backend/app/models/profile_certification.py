from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class CertificationEntry(Base):
    __tablename__ = "certification_entry"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    issuer: Mapped[str] = mapped_column(String(255), nullable=False)
    issued_on: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    expires_on: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    credential_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    verification_link: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    attachment_file_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    attachment_file_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    attachment_mime_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now(), onupdate=func.now())
