from __future__ import annotations

from uuid import uuid4

from sqlalchemy.exc import IntegrityError

from app.models.application import Application
from app.models.company import Company
from app.models.job_platform import JobPlatform
from app.models.resume import Resume


def test_application_rejects_cross_tenant_platform_fk(db_session, as_user, user_a, user_b, now_utc):
    as_user(user_a)
    platform_name = f"Platform-A-{uuid4().hex[:6]}"
    platform = JobPlatform(
        user_id=user_a,
        name=platform_name,
        registered_at=now_utc,
        manual_resume=False,
    )
    db_session.add(platform)
    db_session.flush()
    db_session.commit()

    as_user(user_b)
    app = Application(
        user_id=user_b,
        platform_id=platform.id,
        job_title="Engineer",
        current_stage="application",
        status="active",
        applied_at=now_utc,
    )
    db_session.add(app)
    try:
        db_session.flush()
    except IntegrityError:
        db_session.rollback()
        return
    assert False, "Cross-tenant platform FK must fail"


def test_application_rejects_cross_tenant_resume_and_company_fk(db_session, as_user, user_a, user_b, now_utc):
    as_user(user_a)
    resume_name = f"Resume-A-{uuid4().hex[:6]}"
    company_name = f"Company-A-{uuid4().hex[:6]}"
    resume_a = Resume(user_id=user_a, name=resume_name, file_path="users/a/resume.pdf")
    company_a = Company(user_id=user_a, name=company_name)
    db_session.add_all([resume_a, company_a])
    db_session.commit()

    as_user(user_b)
    platform_b = JobPlatform(
        user_id=user_b,
        name="Platform B",
        registered_at=now_utc,
        manual_resume=False,
    )
    db_session.add(platform_b)
    db_session.commit()

    app = Application(
        user_id=user_b,
        platform_id=platform_b.id,
        resume_id=resume_a.id,
        company_id=company_a.id,
        job_title="Engineer",
        current_stage="application",
        status="active",
        applied_at=now_utc,
    )
    db_session.add(app)
    try:
        db_session.flush()
    except IntegrityError:
        db_session.rollback()
        return
    assert False, "Cross-tenant resume/company FK must fail"
