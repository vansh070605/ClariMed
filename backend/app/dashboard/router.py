from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.session import get_db
from app.database.models import User, Report, ReportMeasurement, TrendSnapshot
from app.auth.dependencies import get_current_user
from app.trends.analyzer import analyze_biomarker_trends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter(tags=["Dashboard"])

class DashboardResponse(BaseModel):
    total_reports: int
    abnormal_findings: int
    improving_trends: int
    latest_upload: Optional[datetime] = None

@router.get("", response_model=DashboardResponse, status_code=status.HTTP_200_OK)
async def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Total reports
    total_reports = db.query(Report).filter(Report.user_id == current_user.id).count()
    
    # Latest upload
    latest_report = db.query(Report).filter(Report.user_id == current_user.id).order_by(desc(Report.created_at)).first()
    latest_upload = latest_report.created_at if latest_report else None
    
    # Abnormal findings (unique latest? Or just all time? Usually "Current Abnormal Findings" means from the latest reports, but let's just count all abnormal findings across all reports, or distinct biomarkers. The requirement just says "abnormal_findings: 7". Let's count distinct biomarkers that were abnormal in their most recent measurement. Actually, let's just use the `TrendSnapshot` or `analyze_biomarker_trends` to get current state.)
    
    # We can use the deterministic trend analyzer to figure out both "abnormal_findings" and "improving_trends"
    trend_data = analyze_biomarker_trends(db, current_user.id)
    
    # Improving trends
    improving_trends = sum(1 for t in trend_data.get("trends", []) if t["classification"] == "IMPROVING")
    
    # For abnormal findings, let's count the number of tracked biomarkers that currently have an abnormal flag in their latest measurement.
    # A faster way: get the latest measurement for each biomarker.
    # Since trend_data groups by biomarker and sorts by date, we can just look at `latest_value`.
    # But `trend_data` doesn't include `abnormal_flag`. 
    # Let's query it.
    abnormal_count = 0
    if latest_report:
        # Just count abnormal flags in the latest report
        abnormal_count = db.query(ReportMeasurement).filter(
            ReportMeasurement.report_id == latest_report.id,
            ReportMeasurement.abnormal_flag == True
        ).count()
        
    return DashboardResponse(
        total_reports=total_reports,
        abnormal_findings=abnormal_count,
        improving_trends=improving_trends,
        latest_upload=latest_upload
    )
