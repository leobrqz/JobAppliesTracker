"""grant_public_schema_usage

Revision ID: e8a7c0d5b3a1
Revises: d4c9f8e2a1f2
Create Date: 2026-03-26 22:30:00.000000
"""

from typing import Sequence, Union

from alembic import op


revision: str = "e8a7c0d5b3a1"
down_revision: Union[str, Sequence[str], None] = "d4c9f8e2a1f2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("GRANT USAGE ON SCHEMA public TO authenticated;")


def downgrade() -> None:
    op.execute("REVOKE USAGE ON SCHEMA public FROM authenticated;")

