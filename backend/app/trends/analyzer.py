from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import asc
import uuid
from app.database.models import ReportMeasurement, Report

OPTIMAL_DIRECTION = {
    "hemoglobin": "HIGHER",
    "vitamin_d": "HIGHER",
    "hdl_cholesterol": "HIGHER",

    "hba1c": "LOWER",
    "ldl_cholesterol": "LOWER",
    "triglycerides": "LOWER",
    "glucose": "LOWER"
}

def classify_trend(change_percent: float, optimal_direction: str) -> str:
    """
    Classifies a trend based on change percent and clinical optimal direction.
    """
    if abs(change_percent) < 5.0:
        return "STABLE"
        
    if optimal_direction == "HIGHER":
        return "IMPROVING" if change_percent >= 5.0 else "DECLINING"
    elif optimal_direction == "LOWER":
        return "IMPROVING" if change_percent <= -5.0 else "DECLINING"
    else:
        # Default: assuming higher is better if unspecified
        return "IMPROVING" if change_percent >= 5.0 else "DECLINING"

def analyze_biomarker_trends(db: Session, user_id: uuid.UUID) -> Dict[str, Any]:
    """
    Retrieves all measurements for a user, grouped by biomarker, and computes trends.
    """
    # Join reports to get accurate created_at timestamps if needed, 
    # but measurement has its own created_at. We will order by measurement created_at.
    # We'll filter for measurements belonging to the user.
    measurements = db.query(ReportMeasurement).filter(
        ReportMeasurement.user_id == user_id
    ).order_by(asc(ReportMeasurement.created_at)).all()
    
    # Group by biomarker
    grouped_data: Dict[str, List[Dict[str, Any]]] = {}
    reports_seen = set()
    
    for m in measurements:
        name = m.biomarker_name
        reports_seen.add(m.report_id)
        if name not in grouped_data:
            grouped_data[name] = []
            
        grouped_data[name].append({
            "date": m.created_at.isoformat(),
            "value": m.value,
            "unit": m.unit
        })
        
    trends = []
    
    for biomarker, history in grouped_data.items():
        if len(history) < 2:
            trends.append({
                "biomarker": biomarker,
                "classification": "INSUFFICIENT_DATA",
                "change_percent": 0.0,
                "first_value": history[0]["value"] if history else None,
                "latest_value": history[-1]["value"] if history else None,
                "report_count": len(history)
            })
            continue
            
        first_value = history[0]["value"]
        latest_value = history[-1]["value"]
        
        if first_value == 0:
            change_percent = 0.0 # Prevent division by zero
        else:
            change_percent = ((latest_value - first_value) / first_value) * 100.0
            
        optimal_dir = OPTIMAL_DIRECTION.get(biomarker)
        classification = classify_trend(change_percent, optimal_dir)
        
        trends.append({
            "biomarker": biomarker,
            "classification": classification,
            "change_percent": round(change_percent, 2),
            "first_value": first_value,
            "latest_value": latest_value,
            "report_count": len(history)
        })
        
    return {
        "total_reports": len(reports_seen),
        "tracked_biomarkers": len(grouped_data),
        "trends": trends
    }
