"""add_company

Revision ID: 3f8a2c9d14e7
Revises: c84706b0babd
Create Date: 2026-03-09

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "3f8a2c9d14e7"
down_revision: Union[str, None] = "c84706b0babd"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "company",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("website", sa.String(500), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index("ix_company_name", "company", ["name"])

    op.add_column("application", sa.Column("company_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_application_company_id",
        "application",
        "company",
        ["company_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index("ix_application_company_id", "application", ["company_id"])


def downgrade() -> None:
    op.drop_index("ix_application_company_id", table_name="application")
    op.drop_constraint("fk_application_company_id", "application", type_="foreignkey")
    op.drop_column("application", "company_id")
    op.drop_index("ix_company_name", table_name="company")
    op.drop_table("company")
