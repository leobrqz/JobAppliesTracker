"""Add salary_currency and pay_period to application."""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "add_salary_currency_pay_period"
down_revision: Union[str, None] = "add_company_name_ci_index"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("application", sa.Column("salary_currency", sa.String(3), nullable=True))
    op.add_column("application", sa.Column("pay_period", sa.String(20), nullable=True))


def downgrade() -> None:
    op.drop_column("application", "pay_period")
    op.drop_column("application", "salary_currency")
