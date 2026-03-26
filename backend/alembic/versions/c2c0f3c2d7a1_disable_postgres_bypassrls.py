"""disable_postgres_bypassrls

Revision ID: c2c0f3c2d7a1
Revises: b3e5f7a9c122
Create Date: 2026-03-26 22:10:00.000000
"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "c2c0f3c2d7a1"
down_revision: Union[str, Sequence[str], None] = "b3e5f7a9c122"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # This repository's backend DB user cannot alter privileged roles in the current Supabase setup.
    # Runtime RLS enforcement is handled by switching to the non-bypass `authenticated` role per transaction
    # and injecting the authenticated subject via request.jwt.claim.sub (see backend/app/core/database.py).
    op.execute("SELECT 1;")


def downgrade() -> None:
    op.execute("SELECT 1;")

