from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional, List, Dict, Any
from app.schemas.report import ReportDetailResponse
from app.schemas.trend import TrendResponse

class ShareGenerateRequest(BaseModel):
    report_id: Optional[UUID4] = None
    expires_in_days: int = 7

class ShareGenerateResponse(BaseModel):
    token: str
    expires_at: datetime

class SharedDataResponse(BaseModel):
    patient_name: str
    reports: List[ReportDetailResponse]
    trends: Optional[TrendResponse] = None
