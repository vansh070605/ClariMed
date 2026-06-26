from typing import Dict, Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import asc
from app.database.session import get_db
from app.database.models import User, TrendSnapshot, ReportMeasurement
from app.auth.dependencies import get_current_user
from app.schemas.trend import TrendResponse
from app.trends.analyzer import analyze_biomarker_trends

router = APIRouter(tags=["Trends"])


@router.get("", response_model=TrendResponse, status_code=status.HTTP_200_OK)
async def get_trends(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    # Calculate trends deterministically based on historical reports
    trend_data = analyze_biomarker_trends(db, current_user.id)

    # Save a snapshot for caching / fast dashboard loads later
    snapshot = TrendSnapshot(user_id=current_user.id, trend_data=trend_data)
    db.add(snapshot)
    db.commit()

    return trend_data


@router.get(
    "/history", response_model=Dict[str, Dict[str, Any]], status_code=status.HTTP_200_OK
)
async def get_trends_history(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    measurements = (
        db.query(ReportMeasurement)
        .filter(ReportMeasurement.user_id == current_user.id)
        .order_by(asc(ReportMeasurement.created_at))
        .all()
    )

    history: Dict[str, Dict[str, Any]] = {}

    for m in measurements:
        name = m.biomarker_name
        if name not in history:
            history[name] = {"category": m.category or "Uncategorized", "history": []}

        history[name]["history"].append(
            {"date": m.created_at.isoformat(), "value": m.value}
        )

    return history
