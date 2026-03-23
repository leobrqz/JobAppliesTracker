"""Add certifications, courses, and about me tables."""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "add_profile_cert_courses"
down_revision: Union[str, None] = "add_profile_structured_sections"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
  op.create_table(
      "certification_entry",
      sa.Column("id", sa.Integer(), nullable=False),
      sa.Column("name", sa.String(length=255), nullable=False),
      sa.Column("issuer", sa.String(length=255), nullable=False),
      sa.Column("issued_on", sa.Date(), nullable=True),
      sa.Column("expires_on", sa.Date(), nullable=True),
      sa.Column("credential_id", sa.String(length=255), nullable=True),
      sa.Column("verification_link", sa.String(length=500), nullable=True),
      sa.Column("attachment_file_path", sa.String(length=500), nullable=True),
      sa.Column("attachment_file_name", sa.String(length=255), nullable=True),
      sa.Column("attachment_mime_type", sa.String(length=100), nullable=True),
      sa.Column("notes", sa.Text(), nullable=True),
      sa.Column("display_order", sa.Integer(), nullable=False),
      sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
      sa.Column("updated_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
      sa.PrimaryKeyConstraint("id"),
  )
  op.create_index("ix_certification_entry_display_order", "certification_entry", ["display_order"])

  op.create_table(
      "course_entry",
      sa.Column("id", sa.Integer(), nullable=False),
      sa.Column("title", sa.String(length=255), nullable=False),
      sa.Column("provider", sa.String(length=255), nullable=False),
      sa.Column("completed_on", sa.Date(), nullable=True),
      sa.Column("duration_hours", sa.Numeric(8, 2), nullable=True),
      sa.Column("verification_link", sa.String(length=500), nullable=True),
      sa.Column("attachment_file_path", sa.String(length=500), nullable=True),
      sa.Column("attachment_file_name", sa.String(length=255), nullable=True),
      sa.Column("attachment_mime_type", sa.String(length=100), nullable=True),
      sa.Column("notes", sa.Text(), nullable=True),
      sa.Column("display_order", sa.Integer(), nullable=False),
      sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
      sa.Column("updated_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
      sa.PrimaryKeyConstraint("id"),
  )
  op.create_index("ix_course_entry_display_order", "course_entry", ["display_order"])

  op.create_table(
      "profile_about_me",
      sa.Column("id", sa.Integer(), nullable=False),
      sa.Column("description", sa.Text(), nullable=False),
      sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
      sa.Column("updated_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
      sa.PrimaryKeyConstraint("id"),
  )


def downgrade() -> None:
  op.drop_table("profile_about_me")
  op.drop_index("ix_course_entry_display_order", table_name="course_entry")
  op.drop_table("course_entry")
  op.drop_index("ix_certification_entry_display_order", table_name="certification_entry")
  op.drop_table("certification_entry")
