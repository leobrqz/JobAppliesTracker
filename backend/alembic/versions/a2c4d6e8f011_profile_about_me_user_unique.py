"""profile_about_me_user_unique

Revision ID: a2c4d6e8f011
Revises: 9a1f2b7c4d10
Create Date: 2026-03-26 21:20:00.000000
"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "a2c4d6e8f011"
down_revision: Union[str, Sequence[str], None] = "9a1f2b7c4d10"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        DELETE FROM profile_about_me p
        USING profile_about_me newer
        WHERE p.user_id = newer.user_id
          AND (
            p.created_at > newer.created_at
            OR (p.created_at = newer.created_at AND p.id > newer.id)
          );
        """
    )
    op.execute(
        """
        SELECT setval(
          pg_get_serial_sequence('profile_about_me', 'id'),
          COALESCE((SELECT MAX(id) FROM profile_about_me), 1),
          true
        );
        """
    )
    op.create_unique_constraint("uq_profile_about_me_user_id", "profile_about_me", ["user_id"])


def downgrade() -> None:
    op.drop_constraint("uq_profile_about_me_user_id", "profile_about_me", type_="unique")
