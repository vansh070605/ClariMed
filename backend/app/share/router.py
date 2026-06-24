import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.session import get_db
from app.database.models import User, SharedLink, Report, TrendSnapshot
from app.auth.router import get_current_user
from app.schemas.share import ShareGenerateRequest, ShareGenerateResponse, SharedDataResponse

router = APIRouter()

@router.post("/generate", response_model=ShareGenerateResponse)
def generate_share_link(
    request: ShareGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify report belongs to user if specified
    if request.report_id:
        report = db.query(Report).filter(Report.id == request.report_id, Report.user_id == current_user.id).first()
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
            
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(days=request.expires_in_days)
    
    shared_link = SharedLink(
        token=token,
        user_id=current_user.id,
        report_id=request.report_id,
        expires_at=expires_at
    )
    
    db.add(shared_link)
    db.commit()
    db.refresh(shared_link)
    
    return ShareGenerateResponse(
        token=token,
        expires_at=expires_at
    )

@router.get("/{token}", response_model=SharedDataResponse)
def get_shared_data(token: str, db: Session = Depends(get_db)):
    shared_link = db.query(SharedLink).filter(SharedLink.token == token).first()
    
    if not shared_link:
        raise HTTPException(status_code=404, detail="Link not found or invalid")
        
    # Make sure expires_at and now() are timezone aware or both naive
    now_utc = datetime.now(timezone.utc)
    if shared_link.expires_at.tzinfo is None:
        # if db drops tz info, assume UTC
        now_utc = now_utc.replace(tzinfo=None)

    if shared_link.expires_at < now_utc:
        raise HTTPException(status_code=410, detail="Link has expired")
        
    user = db.query(User).filter(User.id == shared_link.user_id).first()
    
    reports_query = db.query(Report).filter(Report.user_id == user.id)
    if shared_link.report_id:
        reports_query = reports_query.filter(Report.id == shared_link.report_id)
        
    reports = reports_query.order_by(desc(Report.created_at)).all()
    
    # Get latest trends
    latest_trend = db.query(TrendSnapshot).filter(TrendSnapshot.user_id == user.id).order_by(desc(TrendSnapshot.generated_at)).first()
    
    trends_response = None
    if latest_trend:
        # Convert the JSON to the proper structure for the Pydantic schema
        trends_response = latest_trend.trend_data

    # Return structured data
    return SharedDataResponse(
        patient_name=user.name,
        reports=reports,
        trends=trends_response
    )
