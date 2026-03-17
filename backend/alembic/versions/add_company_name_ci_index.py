"""Add case-insensitive unique index on company.name."""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "add_company_name_ci_index"
down_revision: Union[str, None] = "a7b3e1f24c90"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
  op.execute(
      """
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1
              FROM pg_indexes
              WHERE schemaname = 'public'
                AND indexname = 'uq_company_name_ci'
          ) THEN
              CREATE UNIQUE INDEX uq_company_name_ci ON company (LOWER(name));
          END IF;
      END
      $$;
      """
  )


def downgrade() -> None:
  op.execute(
      """
      DROP INDEX IF EXISTS uq_company_name_ci;
      """
  )

