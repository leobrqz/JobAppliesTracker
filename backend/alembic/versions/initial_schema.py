"""initial_schema

Revision ID: fe79fdce9d00
Revises:
Create Date: 2026-03-08

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "fe79fdce9d00"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "resume",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("file_path", sa.String(500), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("archived_at", sa.TIMESTAMP(), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    op.create_table(
        "profile_data",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("label", sa.String(100), nullable=False),
        sa.Column("value", sa.Text(), nullable=False),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "platform_template",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("icon", sa.String(500), nullable=True),
        sa.Column("base_url", sa.String(500), nullable=True),
        sa.Column("applications_url", sa.String(500), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "job_platform",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("icon", sa.String(500), nullable=True),
        sa.Column("base_url", sa.String(500), nullable=True),
        sa.Column("applications_url", sa.String(500), nullable=True),
        sa.Column("registered_at", sa.TIMESTAMP(), nullable=False),
        sa.Column("manual_resume", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "application",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("platform_id", sa.Integer(), nullable=False),
        sa.Column("job_title", sa.String(255), nullable=False),
        sa.Column("company", sa.String(255), nullable=True),
        sa.Column("salary", sa.Numeric(12, 2), nullable=True),
        sa.Column("seniority", sa.String(50), nullable=True),
        sa.Column("contract_type", sa.String(50), nullable=True),
        sa.Column("application_url", sa.String(500), nullable=True),
        sa.Column("current_stage", sa.String(100), nullable=False),
        sa.Column("status", sa.String(50), nullable=False),
        sa.Column("applied_at", sa.TIMESTAMP(), nullable=False),
        sa.Column("resume_id", sa.Integer(), nullable=True),
        sa.Column("archived_at", sa.TIMESTAMP(), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["platform_id"], ["job_platform.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["resume_id"], ["resume.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_application_platform_id", "application", ["platform_id"])
    op.create_index("ix_application_applied_at", "application", ["applied_at"])

    op.create_table(
        "application_history",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("application_id", sa.Integer(), nullable=False),
        sa.Column("stage", sa.String(100), nullable=False),
        sa.Column("date", sa.TIMESTAMP(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["application_id"], ["application.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_application_history_application_id", "application_history", ["application_id"])
    op.create_index("ix_application_history_date", "application_history", ["date"])


def downgrade() -> None:
    op.drop_index("ix_application_history_date", table_name="application_history")
    op.drop_index("ix_application_history_application_id", table_name="application_history")
    op.drop_table("application_history")
    op.drop_index("ix_application_applied_at", table_name="application")
    op.drop_index("ix_application_platform_id", table_name="application")
    op.drop_table("application")
    op.drop_table("job_platform")
    op.drop_table("platform_template")
    op.drop_table("profile_data")
    op.drop_table("resume")
