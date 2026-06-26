import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import User, Report
from app.auth.dependencies import get_current_user
from app.schemas.report import ReportResponse
from app.core.config import settings
from app.reports.parser import extract_text_from_pdf
from app.websockets import manager

router = APIRouter(tags=["Reports"])

import hashlib
from typing import List
from sqlalchemy import desc

from app.schemas.report import ReportListResponse, ReportDetailResponse


@router.get("", response_model=List[ReportListResponse])
async def list_reports(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reports = (
        db.query(Report)
        .filter(Report.user_id == current_user.id)
        .order_by(desc(Report.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )

    return reports


@router.get("/{report_id}", response_model=ReportDetailResponse)
async def get_report_details(
    report_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = (
        db.query(Report)
        .filter(Report.id == report_id, Report.user_id == current_user.id)
        .first()
    )
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    measurements = (
        db.query(ReportMeasurement)
        .filter(ReportMeasurement.report_id == report.id)
        .all()
    )

    return {
        "id": report.id,
        "status": report.status,
        "file_size": report.file_size,
        "page_count": report.page_count,
        "created_at": report.created_at,
        "measurements": measurements,
        "patient_summary": report.patient_summary,
    }


@router.delete("/{report_id}")
async def delete_report(
    report_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = (
        db.query(Report)
        .filter(Report.id == report_id, Report.user_id == current_user.id)
        .first()
    )
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Delete report from database (measurements will cascade if FK is ON DELETE CASCADE,
    # but we will explicitly delete measurements first to be safe if cascade isn't set up perfectly)
    db.query(ReportMeasurement).filter(
        ReportMeasurement.report_id == report.id
    ).delete()
    db.delete(report)
    db.commit()

    # Also attempt to delete file from disk
    if report.file_path and os.path.exists(report.file_path):
        try:
            os.remove(report.file_path)
        except Exception:
            pass  # Non-fatal if file already gone

    return {"status": "deleted"}


MAX_FILE_SIZE_MB = 10
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024


@router.post(
    "/upload", response_model=ReportResponse, status_code=status.HTTP_201_CREATED
)
async def upload_report(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # Read file content for size and hash
    content = await file.read()
    file_size = len(content)

    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE_MB}MB.",
        )

    file_hash = hashlib.sha256(content).hexdigest()

    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Create unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    # Save file to disk
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")

    # Extract raw text
    page_count = None
    try:
        raw_text, page_count = extract_text_from_pdf(file_path)

        if not raw_text or not raw_text.strip():
            status_val = "ocr_required"
        else:
            status_val = "parsed"

    except Exception:
        raw_text = None
        status_val = "failed"

    # Create database record
    new_report = Report(
        user_id=current_user.id,
        file_path=file_path,
        file_hash=file_hash,
        file_size=file_size,
        page_count=page_count,
        status=status_val,
        raw_text=raw_text,
    )

    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    return new_report


from typing import List
from app.database.models import ReportMeasurement
from app.schemas.report import ReportMeasurementResponse
from app.intelligence.extractor import extract_measurements_from_text
from app.intelligence.validation import validate_measurements
from app.intelligence.evaluation import evaluate_measurements
from app.intelligence.normalization import normalize_biomarker_name
from app.intelligence.categories import get_biomarker_category
from app.intelligence.interpreter import apply_interpretation
from app.intelligence.confidence import generate_confidence_scores


@router.post("/{report_id}/analyze", response_model=List[ReportMeasurementResponse])
async def analyze_report(
    report_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = (
        db.query(Report)
        .filter(Report.id == report_id, Report.user_id == current_user.id)
        .first()
    )
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if not report.raw_text:
        raise HTTPException(
            status_code=400, detail="Report has no text to extract. OCR required."
        )

    # 1. Deterministic Extraction
    raw_measurements = extract_measurements_from_text(report.raw_text)

    # 2. Validation
    accepted_measurements, dropped = validate_measurements(raw_measurements)

    # 3. Evaluate Abnormal Flags
    evaluated_measurements = evaluate_measurements(accepted_measurements)

    # Apply Clinical Interpretation Layer
    final_measurements = []
    for m in evaluated_measurements:
        # 4. Normalize
        m["biomarker_name"] = normalize_biomarker_name(m["biomarker_name"])

        # 5. Category
        m["category"] = get_biomarker_category(m["biomarker_name"])

        # 6. Interpret Severity
        apply_interpretation(m)

        # 7. Confidence Scoring
        generate_confidence_scores(m)

        final_measurements.append(m)

    # 8. Duplicate Protection (Idempotent Delete)
    db.query(ReportMeasurement).filter(
        ReportMeasurement.report_id == report.id
    ).delete()

    # 9. Save to DB
    db_measurements = []
    for m in final_measurements:
        db_m = ReportMeasurement(
            report_id=report.id,
            user_id=current_user.id,
            biomarker_name=m["biomarker_name"],
            category=m["category"],
            value=m["value"],
            unit=m.get("unit"),
            reference_low=m.get("reference_low"),
            reference_high=m.get("reference_high"),
            abnormal_flag=m.get("abnormal_flag"),
            status=m.get("status"),
            severity=m.get("severity"),
            delta_percent=m.get("delta_percent"),
        )
        db_measurements.append(db_m)

    db.add_all(db_measurements)

    # 10. Also save as JSONB artifact for source of truth (includes confidence)
    report.extracted_entities = final_measurements
    report.status = "analyzed"

    db.commit()

    # Expose overall confidence for the response model
    for db_m, final_m in zip(db_measurements, final_measurements):
        db_m.overall_confidence = final_m.get("overall_confidence")

    await manager.send_personal_message(
        {
            "type": "NOTIFICATION",
            "title": "Extraction Complete",
            "message": "Successfully extracted clinical biomarkers from the report.",
            "report_id": str(report.id),
        },
        str(current_user.id),
    )

    return db_measurements


from app.intelligence.summarizer import generate_patient_summary
from fastapi.responses import JSONResponse


@router.post("/{report_id}/summarize")
async def summarize_report(
    report_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = (
        db.query(Report)
        .filter(Report.id == report_id, Report.user_id == current_user.id)
        .first()
    )
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    measurements = (
        db.query(ReportMeasurement)
        .filter(ReportMeasurement.report_id == report.id)
        .all()
    )
    if not measurements:
        raise HTTPException(
            status_code=400,
            detail="No extracted measurements found. Run analysis first.",
        )

    # Convert ORM objects to dicts for the summarizer
    measurements_dict = [
        {
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
        }
        for m in measurements
    ]

    summary = generate_patient_summary(measurements_dict)

    if summary.get("status") == "verification_failed":
        raise HTTPException(
            status_code=500,
            detail="Summary generation failed hallucination verification.",
        )

    report.patient_summary = summary
    db.commit()

    await manager.send_personal_message(
        {
            "type": "NOTIFICATION",
            "title": "Summary Ready",
            "message": "AI-generated clinical summary is now available.",
            "report_id": str(report.id),
        },
        str(current_user.id),
    )

    return JSONResponse(status_code=200, content=summary)
