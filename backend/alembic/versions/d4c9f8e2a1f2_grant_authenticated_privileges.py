"""grant_authenticated_privileges

Revision ID: d4c9f8e2a1f2
Revises: c2c0f3c2d7a1
Create Date: 2026-03-26 22:20:00.000000
"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "d4c9f8e2a1f2"
down_revision: Union[str, Sequence[str], None] = "c2c0f3c2d7a1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


USER_OWNED_TABLES = [
    "resume",
    "profile_data",
    "job_platform",
    "company",
    "application",
    "application_history",
    "appointment",
    "experience_entry",
    "experience_bullet",
    "education_entry",
    "education_highlight",
    "project_entry",
    "project_bullet",
    "skill_group",
    "skill_item",
    "certification_entry",
    "course_entry",
    "profile_about_me",
]


def upgrade() -> None:
    for table in USER_OWNED_TABLES:
        op.execute(
            f"""
            GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES ON TABLE public.{table} TO authenticated;
            """
        )

    # Serial PKs require sequence privileges on INSERT.
    op.execute("GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO authenticated;")


def downgrade() -> None:
    for table in USER_OWNED_TABLES:
        op.execute(f"REVOKE SELECT, INSERT, UPDATE, DELETE, REFERENCES ON TABLE public.{table} FROM authenticated;")
    op.execute("REVOKE USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public FROM authenticated;")

