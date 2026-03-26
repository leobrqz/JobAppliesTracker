from __future__ import annotations

from uuid import uuid4

from app.models.application import Application
from app.models.company import Company
from app.models.job_platform import JobPlatform
from app.schemas.company import CompanyUpdate
from app.schemas.profile_about_me import ProfileAboutMeUpdate
from app.services import company as company_service
from app.services import profile_about_me as about_me_service


def test_company_rename_only_updates_current_tenant_rows(db_session, as_user, user_a, user_b, now_utc):
    source_name = f"Acme-{uuid4().hex[:6]}"
    renamed_name = f"Acme-Renamed-{uuid4().hex[:6]}"
    as_user(user_a)
    platform_a = JobPlatform(user_id=user_a, name=f"Platform-A-{uuid4().hex[:6]}", registered_at=now_utc, manual_resume=False)
    company_a = Company(user_id=user_a, name=source_name)
    app_a = Application(
        user_id=user_a,
        platform=platform_a,
        company_ref=company_a,
        company=source_name,
        job_title="Role A",
        current_stage="application",
        status="active",
        applied_at=now_utc,
    )
    db_session.add_all([platform_a, company_a, app_a])
    db_session.commit()

    as_user(user_b)
    platform_b = JobPlatform(user_id=user_b, name=f"Platform-B-{uuid4().hex[:6]}", registered_at=now_utc, manual_resume=False)
    app_b = Application(
        user_id=user_b,
        platform=platform_b,
        company=source_name,
        job_title="Role B",
        current_stage="application",
        status="active",
        applied_at=now_utc,
    )
    db_session.add_all([platform_b, app_b])
    db_session.commit()

    as_user(user_a)
    company_service.update_company(db_session, company_a.id, CompanyUpdate(name=renamed_name))

    db_session.refresh(app_a)
    as_user(user_b)
    db_session.refresh(app_b)
    assert app_a.company == renamed_name
    assert app_b.company == source_name


def test_profile_about_me_isolated_per_user(db_session, as_user, user_a, user_b):
    as_user(user_a)
    about_me_service.update_about_me(db_session, ProfileAboutMeUpdate(description="A"))

    as_user(user_b)
    about_me_service.update_about_me(db_session, ProfileAboutMeUpdate(description="B"))

    as_user(user_a)
    row_a = about_me_service.get_about_me(db_session)
    as_user(user_b)
    row_b = about_me_service.get_about_me(db_session)

    assert row_a.user_id == user_a
    assert row_b.user_id == user_b
    assert row_a.description == "A"
    assert row_b.description == "B"
