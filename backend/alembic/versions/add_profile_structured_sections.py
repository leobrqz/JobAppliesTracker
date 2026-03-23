"""Add structured profile section tables."""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "add_profile_structured_sections"
down_revision: Union[str, None] = "add_salary_currency_pay_period"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
  op.create_table(
      "experience_entry",
      sa.Column("id", sa.Integer(), nullable=False),
      sa.Column("job_title", sa.String(length=255), nullable=False),
      sa.Column("company", sa.String(length=255), nullable=False),
      sa.Column("start_date", sa.Date(), nullable=True),
      sa.Column("end_date", sa.Date(), nullable=True),
      sa.Column("is_current", sa.Boolean(), server_default=sa.text("false"), nullable=False),
      sa.Column("seniority", sa.String(length=100), nullable=True),
      sa.Column("compensation_amount", sa.Numeric(12, 2), nullable=True),
      sa.Column("compensation_currency", sa.String(length=3), nullable=True),
      sa.Column("compensation_period", sa.String(length=20), nullable=True),
      sa.Column("summary", sa.Text(), nullable=True),
      sa.Column("display_order", sa.Integer(), nullable=False),
      sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
      sa.Column("updated_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
      sa.PrimaryKeyConstraint("id"),
  )
  op.create_index("ix_experience_entry_display_order", "experience_entry", ["display_order"])

  op.create_table(
      "experience_bullet",
      sa.Column("id", sa.Integer(), nullable=False),
      sa.Column("experience_entry_id", sa.Integer(), nullable=False),
      sa.Column("content", sa.Text(), nullable=False),
      sa.Column("display_order", sa.Integer(), nullable=False),
      sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
      sa.Column("updated_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
      sa.PrimaryKeyConstraint("id"),
      sa.ForeignKeyConstraint(["experience_entry_id"], ["experience_entry.id"], ondelete="CASCADE"),
  )
  op.create_index("ix_experience_bullet_experience_entry_id", "experience_bullet", ["experience_entry_id"])
  op.create_index("ix_experience_bullet_display_order", "experience_bullet", ["display_order"])

  op.create_table(
      "education_entry",
      sa.Column("id", sa.Integer(), nullable=False),
      sa.Column("institution", sa.String(length=255), nullable=False),
      sa.Column("degree", sa.String(length=255), nullable=False),
      sa.Column("field_of_study", sa.String(length=255), nullable=True),
      sa.Column("start_date", sa.Date(), nullable=True),
      sa.Column("end_date", sa.Date(), nullable=True),
      sa.Column("is_current", sa.Boolean(), server_default=sa.text("false"), nullable=False),
      sa.Column("description", sa.Text(), nullable=True),
      sa.Column("display_order", sa.Integer(), nullable=False),
      sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
      sa.Column("updated_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
      sa.PrimaryKeyConstraint("id"),
  )
  op.create_index("ix_education_entry_display_order", "education_entry", ["display_order"])

  op.create_table(
      "education_highlight",
      sa.Column("id", sa.Integer(), nullable=False),
      sa.Column("education_entry_id", sa.Integer(), nullable=False),
      sa.Column("content", sa.Text(), nullable=False),
      sa.Column("display_order", sa.Integer(), nullable=False),
      sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
      sa.Column("updated_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
      sa.PrimaryKeyConstraint("id"),
      sa.ForeignKeyConstraint(["education_entry_id"], ["education_entry.id"], ondelete="CASCADE"),
  )
  op.create_index("ix_education_highlight_education_entry_id", "education_highlight", ["education_entry_id"])
  op.create_index("ix_education_highlight_display_order", "education_highlight", ["display_order"])

  op.create_table(
      "project_entry",
      sa.Column("id", sa.Integer(), nullable=False),
      sa.Column("name", sa.String(length=255), nullable=False),
      sa.Column("role", sa.String(length=255), nullable=True),
      sa.Column("url", sa.String(length=500), nullable=True),
      sa.Column("repository_url", sa.String(length=500), nullable=True),
      sa.Column("start_date", sa.Date(), nullable=True),
      sa.Column("end_date", sa.Date(), nullable=True),
      sa.Column("is_current", sa.Boolean(), server_default=sa.text("false"), nullable=False),
      sa.Column("description", sa.Text(), nullable=True),
      sa.Column("display_order", sa.Integer(), nullable=False),
      sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
      sa.Column("updated_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
      sa.PrimaryKeyConstraint("id"),
  )
  op.create_index("ix_project_entry_display_order", "project_entry", ["display_order"])

  op.create_table(
      "project_bullet",
      sa.Column("id", sa.Integer(), nullable=False),
      sa.Column("project_entry_id", sa.Integer(), nullable=False),
      sa.Column("content", sa.Text(), nullable=False),
      sa.Column("display_order", sa.Integer(), nullable=False),
      sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
      sa.Column("updated_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
      sa.PrimaryKeyConstraint("id"),
      sa.ForeignKeyConstraint(["project_entry_id"], ["project_entry.id"], ondelete="CASCADE"),
  )
  op.create_index("ix_project_bullet_project_entry_id", "project_bullet", ["project_entry_id"])
  op.create_index("ix_project_bullet_display_order", "project_bullet", ["display_order"])

  op.create_table(
      "skill_group",
      sa.Column("id", sa.Integer(), nullable=False),
      sa.Column("name", sa.String(length=255), nullable=False),
      sa.Column("description", sa.Text(), nullable=True),
      sa.Column("display_order", sa.Integer(), nullable=False),
      sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
      sa.Column("updated_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
      sa.PrimaryKeyConstraint("id"),
  )
  op.create_index("ix_skill_group_display_order", "skill_group", ["display_order"])

  op.create_table(
      "skill_item",
      sa.Column("id", sa.Integer(), nullable=False),
      sa.Column("skill_group_id", sa.Integer(), nullable=False),
      sa.Column("name", sa.String(length=255), nullable=False),
      sa.Column("level", sa.String(length=100), nullable=True),
      sa.Column("display_order", sa.Integer(), nullable=False),
      sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
      sa.Column("updated_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
      sa.PrimaryKeyConstraint("id"),
      sa.ForeignKeyConstraint(["skill_group_id"], ["skill_group.id"], ondelete="CASCADE"),
  )
  op.create_index("ix_skill_item_skill_group_id", "skill_item", ["skill_group_id"])
  op.create_index("ix_skill_item_display_order", "skill_item", ["display_order"])


def downgrade() -> None:
  op.drop_index("ix_skill_item_display_order", table_name="skill_item")
  op.drop_index("ix_skill_item_skill_group_id", table_name="skill_item")
  op.drop_table("skill_item")

  op.drop_index("ix_skill_group_display_order", table_name="skill_group")
  op.drop_table("skill_group")

  op.drop_index("ix_project_bullet_display_order", table_name="project_bullet")
  op.drop_index("ix_project_bullet_project_entry_id", table_name="project_bullet")
  op.drop_table("project_bullet")

  op.drop_index("ix_project_entry_display_order", table_name="project_entry")
  op.drop_table("project_entry")

  op.drop_index("ix_education_highlight_display_order", table_name="education_highlight")
  op.drop_index("ix_education_highlight_education_entry_id", table_name="education_highlight")
  op.drop_table("education_highlight")

  op.drop_index("ix_education_entry_display_order", table_name="education_entry")
  op.drop_table("education_entry")

  op.drop_index("ix_experience_bullet_display_order", table_name="experience_bullet")
  op.drop_index("ix_experience_bullet_experience_entry_id", table_name="experience_bullet")
  op.drop_table("experience_bullet")

  op.drop_index("ix_experience_entry_display_order", table_name="experience_entry")
  op.drop_table("experience_entry")
