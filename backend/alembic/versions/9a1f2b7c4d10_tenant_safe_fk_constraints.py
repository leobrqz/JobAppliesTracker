"""tenant_safe_fk_constraints

Revision ID: 9a1f2b7c4d10
Revises: 6d3c9a5b9d41
Create Date: 2026-03-26 21:10:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9a1f2b7c4d10"
down_revision: Union[str, Sequence[str], None] = "6d3c9a5b9d41"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _assert_no_cross_tenant_links() -> None:
    op.execute(
        """
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1
            FROM application a
            JOIN job_platform jp ON jp.id = a.platform_id
            WHERE a.user_id <> jp.user_id
          ) THEN
            RAISE EXCEPTION 'Cross-tenant link found: application.platform_id -> job_platform.id';
          END IF;
          IF EXISTS (
            SELECT 1
            FROM application a
            JOIN resume r ON r.id = a.resume_id
            WHERE a.resume_id IS NOT NULL AND a.user_id <> r.user_id
          ) THEN
            RAISE EXCEPTION 'Cross-tenant link found: application.resume_id -> resume.id';
          END IF;
          IF EXISTS (
            SELECT 1
            FROM application a
            JOIN company c ON c.id = a.company_id
            WHERE a.company_id IS NOT NULL AND a.user_id <> c.user_id
          ) THEN
            RAISE EXCEPTION 'Cross-tenant link found: application.company_id -> company.id';
          END IF;
          IF EXISTS (
            SELECT 1
            FROM application_history h
            JOIN application a ON a.id = h.application_id
            WHERE h.user_id <> a.user_id
          ) THEN
            RAISE EXCEPTION 'Cross-tenant link found: application_history.application_id -> application.id';
          END IF;
          IF EXISTS (
            SELECT 1
            FROM appointment ap
            JOIN application a ON a.id = ap.application_id
            WHERE ap.application_id IS NOT NULL AND ap.user_id <> a.user_id
          ) THEN
            RAISE EXCEPTION 'Cross-tenant link found: appointment.application_id -> application.id';
          END IF;
        END $$;
        """
    )


def upgrade() -> None:
    _assert_no_cross_tenant_links()

    op.create_unique_constraint("uq_job_platform_user_id_id", "job_platform", ["user_id", "id"])
    op.create_unique_constraint("uq_resume_user_id_id", "resume", ["user_id", "id"])
    op.create_unique_constraint("uq_company_user_id_id", "company", ["user_id", "id"])
    op.create_unique_constraint("uq_application_user_id_id", "application", ["user_id", "id"])
    op.create_unique_constraint("uq_experience_entry_user_id_id", "experience_entry", ["user_id", "id"])
    op.create_unique_constraint("uq_education_entry_user_id_id", "education_entry", ["user_id", "id"])
    op.create_unique_constraint("uq_project_entry_user_id_id", "project_entry", ["user_id", "id"])
    op.create_unique_constraint("uq_skill_group_user_id_id", "skill_group", ["user_id", "id"])

    op.create_index("ix_application_user_platform_fk", "application", ["user_id", "platform_id"], unique=False)
    op.create_index("ix_application_user_resume_fk", "application", ["user_id", "resume_id"], unique=False)
    op.create_index("ix_application_user_company_fk", "application", ["user_id", "company_id"], unique=False)
    op.create_index("ix_history_user_application_fk", "application_history", ["user_id", "application_id"], unique=False)
    op.create_index("ix_appointment_user_application_fk", "appointment", ["user_id", "application_id"], unique=False)
    op.create_index("ix_experience_bullet_user_entry_fk", "experience_bullet", ["user_id", "experience_entry_id"], unique=False)
    op.create_index("ix_education_highlight_user_entry_fk", "education_highlight", ["user_id", "education_entry_id"], unique=False)
    op.create_index("ix_project_bullet_user_entry_fk", "project_bullet", ["user_id", "project_entry_id"], unique=False)
    op.create_index("ix_skill_item_user_group_fk", "skill_item", ["user_id", "skill_group_id"], unique=False)

    op.drop_constraint("application_platform_id_fkey", "application", type_="foreignkey")
    op.drop_constraint("application_resume_id_fkey", "application", type_="foreignkey")
    op.drop_constraint("application_company_id_fkey", "application", type_="foreignkey")
    op.drop_constraint("application_history_application_id_fkey", "application_history", type_="foreignkey")
    op.drop_constraint("appointment_application_id_fkey", "appointment", type_="foreignkey")
    op.drop_constraint("experience_bullet_experience_entry_id_fkey", "experience_bullet", type_="foreignkey")
    op.drop_constraint("education_highlight_education_entry_id_fkey", "education_highlight", type_="foreignkey")
    op.drop_constraint("project_bullet_project_entry_id_fkey", "project_bullet", type_="foreignkey")
    op.drop_constraint("skill_item_skill_group_id_fkey", "skill_item", type_="foreignkey")

    op.create_foreign_key(
        "fk_application_platform_user",
        "application",
        "job_platform",
        ["user_id", "platform_id"],
        ["user_id", "id"],
        ondelete="RESTRICT",
    )
    op.create_foreign_key(
        "fk_application_resume_user",
        "application",
        "resume",
        ["user_id", "resume_id"],
        ["user_id", "id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        "fk_application_company_user",
        "application",
        "company",
        ["user_id", "company_id"],
        ["user_id", "id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        "fk_application_history_application_user",
        "application_history",
        "application",
        ["user_id", "application_id"],
        ["user_id", "id"],
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        "fk_appointment_application_user",
        "appointment",
        "application",
        ["user_id", "application_id"],
        ["user_id", "id"],
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        "fk_experience_bullet_entry_user",
        "experience_bullet",
        "experience_entry",
        ["user_id", "experience_entry_id"],
        ["user_id", "id"],
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        "fk_education_highlight_entry_user",
        "education_highlight",
        "education_entry",
        ["user_id", "education_entry_id"],
        ["user_id", "id"],
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        "fk_project_bullet_entry_user",
        "project_bullet",
        "project_entry",
        ["user_id", "project_entry_id"],
        ["user_id", "id"],
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        "fk_skill_item_group_user",
        "skill_item",
        "skill_group",
        ["user_id", "skill_group_id"],
        ["user_id", "id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    op.drop_constraint("fk_skill_item_group_user", "skill_item", type_="foreignkey")
    op.drop_constraint("fk_project_bullet_entry_user", "project_bullet", type_="foreignkey")
    op.drop_constraint("fk_education_highlight_entry_user", "education_highlight", type_="foreignkey")
    op.drop_constraint("fk_experience_bullet_entry_user", "experience_bullet", type_="foreignkey")
    op.drop_constraint("fk_appointment_application_user", "appointment", type_="foreignkey")
    op.drop_constraint("fk_application_history_application_user", "application_history", type_="foreignkey")
    op.drop_constraint("fk_application_company_user", "application", type_="foreignkey")
    op.drop_constraint("fk_application_resume_user", "application", type_="foreignkey")
    op.drop_constraint("fk_application_platform_user", "application", type_="foreignkey")

    op.create_foreign_key("skill_item_skill_group_id_fkey", "skill_item", "skill_group", ["skill_group_id"], ["id"], ondelete="CASCADE")
    op.create_foreign_key("project_bullet_project_entry_id_fkey", "project_bullet", "project_entry", ["project_entry_id"], ["id"], ondelete="CASCADE")
    op.create_foreign_key("education_highlight_education_entry_id_fkey", "education_highlight", "education_entry", ["education_entry_id"], ["id"], ondelete="CASCADE")
    op.create_foreign_key("experience_bullet_experience_entry_id_fkey", "experience_bullet", "experience_entry", ["experience_entry_id"], ["id"], ondelete="CASCADE")
    op.create_foreign_key("appointment_application_id_fkey", "appointment", "application", ["application_id"], ["id"], ondelete="CASCADE")
    op.create_foreign_key("application_history_application_id_fkey", "application_history", "application", ["application_id"], ["id"], ondelete="CASCADE")
    op.create_foreign_key("application_company_id_fkey", "application", "company", ["company_id"], ["id"], ondelete="SET NULL")
    op.create_foreign_key("application_resume_id_fkey", "application", "resume", ["resume_id"], ["id"], ondelete="SET NULL")
    op.create_foreign_key("application_platform_id_fkey", "application", "job_platform", ["platform_id"], ["id"], ondelete="RESTRICT")

    op.drop_index("ix_skill_item_user_group_fk", table_name="skill_item")
    op.drop_index("ix_project_bullet_user_entry_fk", table_name="project_bullet")
    op.drop_index("ix_education_highlight_user_entry_fk", table_name="education_highlight")
    op.drop_index("ix_experience_bullet_user_entry_fk", table_name="experience_bullet")
    op.drop_index("ix_appointment_user_application_fk", table_name="appointment")
    op.drop_index("ix_history_user_application_fk", table_name="application_history")
    op.drop_index("ix_application_user_company_fk", table_name="application")
    op.drop_index("ix_application_user_resume_fk", table_name="application")
    op.drop_index("ix_application_user_platform_fk", table_name="application")

    op.drop_constraint("uq_skill_group_user_id_id", "skill_group", type_="unique")
    op.drop_constraint("uq_project_entry_user_id_id", "project_entry", type_="unique")
    op.drop_constraint("uq_education_entry_user_id_id", "education_entry", type_="unique")
    op.drop_constraint("uq_experience_entry_user_id_id", "experience_entry", type_="unique")
    op.drop_constraint("uq_application_user_id_id", "application", type_="unique")
    op.drop_constraint("uq_company_user_id_id", "company", type_="unique")
    op.drop_constraint("uq_resume_user_id_id", "resume", type_="unique")
    op.drop_constraint("uq_job_platform_user_id_id", "job_platform", type_="unique")
