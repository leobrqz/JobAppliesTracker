from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.dashboard import (
    DashboardSummary,
    HeatmapItem,
    PlatformRankingItem,
    RecentApplicationItem,
    StatusDistributionItem,
)
from app.services import dashboard as dashboard_service

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_summary(db: Session = Depends(get_db)) -> DashboardSummary:
    return dashboard_service.get_summary(db)


@router.get("/status-distribution", response_model=list[StatusDistributionItem])
def get_status_distribution(db: Session = Depends(get_db)) -> list[StatusDistributionItem]:
    return dashboard_service.get_status_distribution(db)


@router.get("/recent-applications", response_model=list[RecentApplicationItem])
def get_recent_applications(db: Session = Depends(get_db)) -> list[RecentApplicationItem]:
    return dashboard_service.get_recent_applications(db)


@router.get("/platform-ranking", response_model=list[PlatformRankingItem])
def get_platform_ranking(db: Session = Depends(get_db)) -> list[PlatformRankingItem]:
    return dashboard_service.get_platform_ranking(db)


@router.get("/heatmap", response_model=list[HeatmapItem])
def get_heatmap(db: Session = Depends(get_db)) -> list[HeatmapItem]:
    return dashboard_service.get_heatmap(db)
