from sqlalchemy import func, text
from sqlalchemy.orm import Session

from app.models.application import Application
from app.models.application_history import ApplicationHistory
from app.models.job_platform import JobPlatform
from app.schemas.dashboard import (
    DashboardSummary,
    HeatmapItem,
    PlatformRankingItem,
    RecentApplicationItem,
    StageAvg,
    StatusDistributionItem,
)


def get_summary(db: Session) -> DashboardSummary:
    total = (
        db.query(func.count(Application.id))
        .filter(Application.archived_at.is_(None))
        .scalar()
        or 0
    )

    responded_subquery = (
        db.query(ApplicationHistory.application_id)
        .join(Application, Application.id == ApplicationHistory.application_id)
        .filter(
            Application.archived_at.is_(None),
            ApplicationHistory.stage != "application",
        )
        .distinct()
        .subquery()
    )
    responded = db.query(func.count()).select_from(responded_subquery).scalar() or 0
    response_rate = round((responded / total * 100), 1) if total > 0 else 0.0

    avg_days_rows = db.execute(
        text(
            """
            WITH history_with_next AS (
                SELECT
                    h.stage,
                    EXTRACT(EPOCH FROM (
                        LEAD(h.date) OVER (PARTITION BY h.application_id ORDER BY h.date) - h.date
                    )) / 86400.0 AS days_to_next
                FROM application_history h
                JOIN application a ON a.id = h.application_id
                WHERE a.archived_at IS NULL
            )
            SELECT stage, AVG(days_to_next) AS avg_days
            FROM history_with_next
            WHERE days_to_next IS NOT NULL
            GROUP BY stage
            ORDER BY avg_days DESC
            """
        )
    ).fetchall()

    avg_days_per_stage = [
        StageAvg(stage=row.stage, avg_days=round(float(row.avg_days), 1))
        for row in avg_days_rows
    ]

    return DashboardSummary(
        total_applications=total,
        response_rate=response_rate,
        avg_days_per_stage=avg_days_per_stage,
    )


def get_status_distribution(db: Session) -> list[StatusDistributionItem]:
    rows = (
        db.query(Application.status, func.count(Application.id).label("count"))
        .filter(Application.archived_at.is_(None))
        .group_by(Application.status)
        .order_by(func.count(Application.id).desc())
        .all()
    )
    return [StatusDistributionItem(status=row.status, count=row.count) for row in rows]


def get_recent_applications(db: Session) -> list[RecentApplicationItem]:
    rows = (
        db.query(Application)
        .filter(Application.archived_at.is_(None))
        .order_by(Application.applied_at.desc())
        .limit(10)
        .all()
    )
    return [
        RecentApplicationItem(
            id=row.id,
            job_title=row.job_title,
            company=row.company,
            status=row.status,
            current_stage=row.current_stage,
            applied_at=row.applied_at,
        )
        for row in rows
    ]


def get_platform_ranking(db: Session) -> list[PlatformRankingItem]:
    rows = db.execute(
        text(
            """
            SELECT
                jp.id,
                jp.name,
                COUNT(DISTINCT a.id) AS total,
                COUNT(DISTINCT CASE WHEN oh.application_id IS NOT NULL THEN a.id END) AS conversions
            FROM job_platform jp
            JOIN application a ON a.platform_id = jp.id AND a.archived_at IS NULL
            LEFT JOIN (
                SELECT DISTINCT application_id
                FROM application_history
                WHERE stage = 'offer'
            ) oh ON oh.application_id = a.id
            GROUP BY jp.id, jp.name
            HAVING COUNT(DISTINCT a.id) > 0
            ORDER BY
                CASE WHEN COUNT(DISTINCT a.id) > 0
                    THEN COUNT(DISTINCT CASE WHEN oh.application_id IS NOT NULL THEN a.id END)::float
                         / COUNT(DISTINCT a.id) * 100
                    ELSE 0
                END DESC
            """
        )
    ).fetchall()

    return [
        PlatformRankingItem(
            id=row.id,
            name=row.name,
            total=row.total,
            conversions=row.conversions,
            conversion_rate=round(row.conversions / row.total * 100, 1) if row.total > 0 else 0.0,
        )
        for row in rows
    ]


def get_heatmap(db: Session) -> list[HeatmapItem]:
    rows = db.execute(
        text(
            """
            SELECT
                TO_CHAR(applied_at, 'YYYY-MM-DD') AS date,
                COUNT(*) AS count
            FROM application
            WHERE archived_at IS NULL
            GROUP BY TO_CHAR(applied_at, 'YYYY-MM-DD')
            ORDER BY date
            """
        )
    ).fetchall()
    return [HeatmapItem(date=row.date, count=row.count) for row in rows]
