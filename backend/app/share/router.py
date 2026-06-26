import secrets
from datetime import datetime, timedelta, timezone
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.session import get_db
from app.database.models import (
    User,
    SharedLink,
    Report,
    ReportMeasurement,
    TrendSnapshot,
)
from app.auth.router import get_current_user
from app.schemas.share import ShareGenerateRequest, ShareGenerateResponse

router = APIRouter()


@router.post("/generate", response_model=ShareGenerateResponse)
def generate_share_link(
    request: ShareGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify report belongs to user if specified
    if request.report_id:
        report = (
            db.query(Report)
            .filter(Report.id == request.report_id, Report.user_id == current_user.id)
            .first()
        )
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")

    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(days=request.expires_in_days)

    shared_link = SharedLink(
        token=token,
        user_id=current_user.id,
        report_id=request.report_id,
        expires_at=expires_at,
    )

    db.add(shared_link)
    db.commit()
    db.refresh(shared_link)

    return ShareGenerateResponse(token=token, expires_at=expires_at)


@router.get("/{token}")
def get_shared_data(token: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    shared_link = db.query(SharedLink).filter(SharedLink.token == token).first()

    if not shared_link:
        raise HTTPException(status_code=404, detail="Link not found or invalid")

    # Timezone-safe expiry check
    now_utc = datetime.now(timezone.utc)
    expires_at = shared_link.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at < now_utc:
        raise HTTPException(status_code=410, detail="Link has expired")

    user = db.query(User).filter(User.id == shared_link.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Fetch reports
    reports_query = db.query(Report).filter(Report.user_id == user.id)
    if shared_link.report_id:
        reports_query = reports_query.filter(Report.id == shared_link.report_id)

    reports = reports_query.order_by(desc(Report.created_at)).all()

    # Build response manually — serialize ORM → dict so Pydantic doesn't choke
    reports_data = []
    for report in reports:
        measurements = (
            db.query(ReportMeasurement)
            .filter(ReportMeasurement.report_id == report.id)
            .all()
        )

        reports_data.append(
            {
                "id": str(report.id),
                "status": report.status,
                "file_size": report.file_size,
                "page_count": report.page_count,
                "created_at": (
                    report.created_at.isoformat() if report.created_at else None
                ),
                "patient_summary": report.patient_summary,
                "measurements": [
                    {
                        "id": str(m.id),
                        "report_id": str(m.report_id),
                        "user_id": str(m.user_id),
                        "biomarker_name": m.biomarker_name,
                        "category": m.category,
                        "value": m.value,
                        "unit": m.unit,
                        "reference_low": m.reference_low,
                        "reference_high": m.reference_high,
                        "abnormal_flag": m.abnormal_flag,
                        "status": m.status,
                        "severity": m.severity,
                        "delta_percent": m.delta_percent,
                        "created_at": (
                            m.created_at.isoformat() if m.created_at else None
                        ),
                    }
                    for m in measurements
                ],
            }
        )

    # Fetch latest trends snapshot
    latest_trend = (
        db.query(TrendSnapshot)
        .filter(TrendSnapshot.user_id == user.id)
        .order_by(desc(TrendSnapshot.generated_at))
        .first()
    )

    return {
        "patient_name": user.name,
        "reports": reports_data,
        "trends": latest_trend.trend_data if latest_trend else None,
    }
