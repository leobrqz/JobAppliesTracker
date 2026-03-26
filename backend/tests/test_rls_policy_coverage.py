from __future__ import annotations

from sqlalchemy import text


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

CMDS = ["SELECT", "INSERT", "UPDATE", "DELETE"]


def test_all_user_owned_tables_have_rls_enabled_and_forced(db_session):
    rows = db_session.execute(
        text(
            """
            SELECT c.relname, c.relrowsecurity, c.relforcerowsecurity
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public' AND c.relname = ANY(:tables)
            """
        ),
        {"tables": USER_OWNED_TABLES},
    ).fetchall()
    found = {row.relname: row for row in rows}
    for table in USER_OWNED_TABLES:
        assert table in found
        assert found[table].relrowsecurity is True
        assert found[table].relforcerowsecurity is True


def test_all_user_owned_tables_have_crud_policies(db_session):
    rows = db_session.execute(
        text(
            """
            SELECT tablename, cmd
            FROM pg_policies
            WHERE schemaname = 'public' AND tablename = ANY(:tables)
            """
        ),
        {"tables": USER_OWNED_TABLES},
    ).fetchall()
    existing = {(row.tablename, row.cmd) for row in rows}
    for table in USER_OWNED_TABLES:
        for cmd in CMDS:
            assert (table, cmd) in existing
