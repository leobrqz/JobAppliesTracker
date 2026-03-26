"""tenant_query_indexes

Revision ID: b3e5f7a9c122
Revises: a2c4d6e8f011
Create Date: 2026-03-26 21:30:00.000000
"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "b3e5f7a9c122"
down_revision: Union[str, Sequence[str], None] = "a2c4d6e8f011"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index("ix_application_user_archived_applied_at", "application", ["user_id", "archived_at", "applied_at"], unique=False)
    op.create_index("ix_application_user_archived_stage", "application", ["user_id", "archived_at", "current_stage"], unique=False)
    op.create_index("ix_application_user_archived_status", "application", ["user_id", "archived_at", "status"], unique=False)
    op.create_index("ix_application_history_application_date_desc", "application_history", ["application_id", "date"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_application_history_application_date_desc", table_name="application_history")
    op.drop_index("ix_application_user_archived_status", table_name="application")
    op.drop_index("ix_application_user_archived_stage", table_name="application")
    op.drop_index("ix_application_user_archived_applied_at", table_name="application")
