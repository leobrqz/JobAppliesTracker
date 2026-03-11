"""add_appointment

Revision ID: a7b3e1f24c90
Revises: 3f8a2c9d14e7
Create Date: 2026-03-10

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "a7b3e1f24c90"
down_revision: Union[str, None] = "3f8a2c9d14e7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "appointment",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("application_id", sa.Integer(), nullable=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("platform", sa.String(100), nullable=True),
        sa.Column("meeting_url", sa.String(500), nullable=True),
        sa.Column("starts_at", sa.TIMESTAMP(), nullable=False),
        sa.Column("ends_at", sa.TIMESTAMP(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(
            ["application_id"],
            ["application.id"],
            name="fk_appointment_application_id",
            ondelete="CASCADE",
        ),
    )
    op.create_index("ix_appointment_starts_at", "appointment", ["starts_at"])
    op.create_index("ix_appointment_application_id", "appointment", ["application_id"])


def downgrade() -> None:
    op.drop_index("ix_appointment_application_id", table_name="appointment")
    op.drop_index("ix_appointment_starts_at", table_name="appointment")
    op.drop_table("appointment")
