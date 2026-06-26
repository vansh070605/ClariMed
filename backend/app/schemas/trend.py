from pydantic import BaseModel
from typing import List, Optional


class TrendSummary(BaseModel):
    biomarker: str
    classification: str
    change_percent: float
    first_value: Optional[float]
    latest_value: Optional[float]
    report_count: int


class TrendResponse(BaseModel):
    total_reports: int
    tracked_biomarkers: int
    trends: List[TrendSummary]
