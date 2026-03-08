"""seed_platform_templates

Revision ID: c84706b0babd
Revises: fe79fdce9d00
Create Date: 2026-03-08

"""
from typing import Sequence, Union

from alembic import op

revision: str = "c84706b0babd"
down_revision: Union[str, None] = "fe79fdce9d00"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

PLATFORM_TEMPLATES = [
    {
        "name": "LinkedIn",
        "icon": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/linkedin.svg",
        "base_url": "https://www.linkedin.com",
        "applications_url": "https://www.linkedin.com/my-items/saved-jobs/",
    },
    {
        "name": "Gupy",
        "icon": None,
        "base_url": "https://portal.gupy.io",
        "applications_url": "https://portal.gupy.io/job-search/term",
    },
    {
        "name": "Indeed",
        "icon": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/indeed.svg",
        "base_url": "https://www.indeed.com",
        "applications_url": "https://my.indeed.com/resume",
    },
    {
        "name": "Glassdoor",
        "icon": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/glassdoor.svg",
        "base_url": "https://www.glassdoor.com",
        "applications_url": "https://www.glassdoor.com/member/profile/index.htm",
    },
    {
        "name": "Catho",
        "icon": None,
        "base_url": "https://www.catho.com.br",
        "applications_url": "https://candidate.catho.com.br/curriculo",
    },
]


def upgrade() -> None:
    for template in PLATFORM_TEMPLATES:
        icon_val = f"'{template['icon']}'" if template["icon"] else "NULL"
        base_url_val = f"'{template['base_url']}'" if template["base_url"] else "NULL"
        applications_url_val = (
            f"'{template['applications_url']}'" if template["applications_url"] else "NULL"
        )
        op.execute(
            f"""
            INSERT INTO platform_template (name, icon, base_url, applications_url, created_at)
            VALUES (
                '{template["name"]}',
                {icon_val},
                {base_url_val},
                {applications_url_val},
                now()
            )
            ON CONFLICT DO NOTHING
            """
        )


def downgrade() -> None:
    names = ", ".join(f"'{t['name']}'" for t in PLATFORM_TEMPLATES)
    op.execute(f"DELETE FROM platform_template WHERE name IN ({names})")
