from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class StageAvg(BaseModel):
    stage: str
    avg_days: float


class DashboardSummary(BaseModel):
    total_applications: int
    response_rate: float
    avg_days_per_stage: list[StageAvg]


class StatusDistributionItem(BaseModel):
    status: str
    count: int


class RecentApplicationItem(BaseModel):
    id: int
    job_title: str
    company: Optional[str]
    status: str
    current_stage: str
    applied_at: datetime


class PlatformRankingItem(BaseModel):
    id: int
    name: str
    total: int
    conversions: int
    conversion_rate: float


class HeatmapItem(BaseModel):
    date: str
    count: int
