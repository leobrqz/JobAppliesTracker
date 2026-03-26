from __future__ import annotations

from datetime import datetime, timedelta, timezone
from uuid import UUID, uuid4

import jwt
import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app


def _make_token(*, user_id: UUID) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "aud": settings.SUPABASE_JWT_AUDIENCE,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=10)).timestamp()),
    }
    return jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")


@pytest.mark.integration
def test_cross_tenant_company_read_write_delete_fails():
    client = TestClient(app)

    user_a = uuid4()
    user_b = uuid4()

    token_a = _make_token(user_id=user_a)
    token_b = _make_token(user_id=user_b)
    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    company_name = f"Company-{uuid4().hex[:8]}"

    created_company = client.post(
        "/api/companies/",
        headers=headers_a,
        json={"name": company_name, "website": None, "notes": None},
    )
    assert created_company.status_code == 201
    company_id = created_company.json()["id"]

    # Cross-tenant read/update/delete should be denied.
    assert client.get(f"/api/companies/{company_id}", headers=headers_b).status_code == 404
    assert (
        client.patch(
            f"/api/companies/{company_id}",
            headers=headers_b,
            json={"name": f"Renamed-{uuid4().hex[:8]}"},
        ).status_code
        == 404
    )
    assert client.delete(f"/api/companies/{company_id}", headers=headers_b).status_code == 404

    # Verify user A record is still present.
    assert client.get(f"/api/companies/{company_id}", headers=headers_a).status_code == 200


@pytest.mark.integration
def test_cross_tenant_application_read_write_delete_fails():
    client = TestClient(app)

    user_a = uuid4()
    user_b = uuid4()

    token_a = _make_token(user_id=user_a)
    token_b = _make_token(user_id=user_b)
    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    platform_name = f"Platform-{uuid4().hex[:8]}"
    company_name = f"Company-{uuid4().hex[:8]}"
    applied_date = datetime.now(timezone.utc).date().isoformat()

    created_platform = client.post(
        "/api/job-platforms/",
        headers=headers_a,
        json={
            "name": platform_name,
            "icon": None,
            "base_url": None,
            "applications_url": None,
            "registered_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
            "manual_resume": False,
        },
    )
    assert created_platform.status_code == 201
    platform_id = created_platform.json()["id"]

    created_company = client.post(
        "/api/companies/",
        headers=headers_a,
        json={"name": company_name, "website": None, "notes": None},
    )
    assert created_company.status_code == 201
    company_id = created_company.json()["id"]

    created_application = client.post(
        "/api/applications/",
        headers=headers_a,
        json={
            "platform_id": platform_id,
            "job_title": "Engineer",
            "company_id": company_id,
            "company": None,
            "current_stage": "application",
            "status": "active",
            "applied_at": applied_date,
            "resume_id": None,
        },
    )
    assert created_application.status_code == 201
    application_id = created_application.json()["id"]

    assert client.get(f"/api/applications/{application_id}", headers=headers_b).status_code == 404
    assert (
        client.patch(
            f"/api/applications/{application_id}",
            headers=headers_b,
            json={"status": "inactive"},
        ).status_code
        == 404
    )
    assert client.delete(f"/api/applications/{application_id}", headers=headers_b).status_code == 404

    # Verify user A can still read it.
    assert client.get(f"/api/applications/{application_id}", headers=headers_a).status_code == 200


@pytest.mark.integration
def test_profile_about_me_is_isolated_per_user():
    client = TestClient(app)

    user_a = uuid4()
    user_b = uuid4()

    token_a = _make_token(user_id=user_a)
    token_b = _make_token(user_id=user_b)
    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Initial reads should be isolated (each user gets their own row).
    res_a = client.get("/api/profile-about-me/", headers=headers_a)
    assert res_a.status_code == 200
    res_b = client.get("/api/profile-about-me/", headers=headers_b)
    assert res_b.status_code == 200

    # User B update should not affect user A.
    upd_b = client.put("/api/profile-about-me/", headers=headers_b, json={"description": "B-secrets"})
    assert upd_b.status_code == 200

    res_a2 = client.get("/api/profile-about-me/", headers=headers_a)
    assert res_a2.status_code == 200
    assert res_a2.json()["description"] != "B-secrets"
