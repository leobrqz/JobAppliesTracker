from datetime import datetime
from typing import Optional

from sqlalchemy import String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class PlatformTemplate(Base):
    __tablename__ = "platform_template"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    icon: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    base_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    applications_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())
