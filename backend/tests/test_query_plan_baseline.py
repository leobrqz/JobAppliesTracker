from __future__ import annotations

from sqlalchemy import text


def test_explain_runs_for_application_listing_query(db_session, user_a):
    rows = db_session.execute(
        text(
            """
            EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
            SELECT id
            FROM application
            WHERE user_id = :user_id
              AND archived_at IS NULL
            ORDER BY applied_at DESC
            LIMIT 20
            """
        ),
        {"user_id": str(user_a)},
    ).fetchall()
    plan = "\n".join(row[0] for row in rows)
    assert "Execution Time" in plan
    assert "application" in plan


def test_explain_runs_for_dashboard_heatmap_query(db_session, user_a):
    rows = db_session.execute(
        text(
            """
            EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
            SELECT TO_CHAR(applied_at, 'YYYY-MM-DD') AS date, COUNT(*) AS count
            FROM application
            WHERE archived_at IS NULL AND user_id = :user_id
            GROUP BY TO_CHAR(applied_at, 'YYYY-MM-DD')
            ORDER BY date
            """
        ),
        {"user_id": str(user_a)},
    ).fetchall()
    plan = "\n".join(row[0] for row in rows)
    assert "Execution Time" in plan
