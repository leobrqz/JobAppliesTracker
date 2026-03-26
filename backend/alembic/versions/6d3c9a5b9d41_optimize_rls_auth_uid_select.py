"""optimize_rls_auth_uid_select

Revision ID: 6d3c9a5b9d41
Revises: eca82c108eac
Create Date: 2026-03-26 17:35:00.000000
"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "6d3c9a5b9d41"
down_revision: Union[str, Sequence[str], None] = "eca82c108eac"
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


def _drop_policies() -> None:
    for table_name in USER_OWNED_TABLES:
        op.execute(f"DROP POLICY IF EXISTS {table_name}_select_own ON {table_name};")
        op.execute(f"DROP POLICY IF EXISTS {table_name}_insert_own ON {table_name};")
        op.execute(f"DROP POLICY IF EXISTS {table_name}_update_own ON {table_name};")
        op.execute(f"DROP POLICY IF EXISTS {table_name}_delete_own ON {table_name};")


def _create_policies_with_select_wrapped_uid() -> None:
    for table_name in USER_OWNED_TABLES:
        op.execute(
            f"""
            CREATE POLICY {table_name}_select_own ON {table_name}
            FOR SELECT TO authenticated
            USING ((select auth.uid()) IS NOT NULL AND (select auth.uid()) = user_id);
            """
        )
        op.execute(
            f"""
            CREATE POLICY {table_name}_insert_own ON {table_name}
            FOR INSERT TO authenticated
            WITH CHECK ((select auth.uid()) IS NOT NULL AND (select auth.uid()) = user_id);
            """
        )
        op.execute(
            f"""
            CREATE POLICY {table_name}_update_own ON {table_name}
            FOR UPDATE TO authenticated
            USING ((select auth.uid()) IS NOT NULL AND (select auth.uid()) = user_id)
            WITH CHECK ((select auth.uid()) IS NOT NULL AND (select auth.uid()) = user_id);
            """
        )
        op.execute(
            f"""
            CREATE POLICY {table_name}_delete_own ON {table_name}
            FOR DELETE TO authenticated
            USING ((select auth.uid()) IS NOT NULL AND (select auth.uid()) = user_id);
            """
        )


def _create_policies_with_plain_uid() -> None:
    for table_name in USER_OWNED_TABLES:
        op.execute(
            f"""
            CREATE POLICY {table_name}_select_own ON {table_name}
            FOR SELECT TO authenticated
            USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);
            """
        )
        op.execute(
            f"""
            CREATE POLICY {table_name}_insert_own ON {table_name}
            FOR INSERT TO authenticated
            WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);
            """
        )
        op.execute(
            f"""
            CREATE POLICY {table_name}_update_own ON {table_name}
            FOR UPDATE TO authenticated
            USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
            WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);
            """
        )
        op.execute(
            f"""
            CREATE POLICY {table_name}_delete_own ON {table_name}
            FOR DELETE TO authenticated
            USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);
            """
        )


def upgrade() -> None:
    _drop_policies()
    _create_policies_with_select_wrapped_uid()


def downgrade() -> None:
    _drop_policies()
    _create_policies_with_plain_uid()
