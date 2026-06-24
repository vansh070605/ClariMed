from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional, List, Dict, Any

class ReportMeasurementBase(BaseModel):
    biomarker_name: str
    category: Optional[str] = None
    value: float
    unit: Optional[str] = None
    reference_low: Optional[float] = None
    reference_high: Optional[float] = None
    abnormal_flag: Optional[bool] = None
    status: Optional[str] = None
    severity: Optional[str] = None
    delta_percent: Optional[float] = None
    overall_confidence: Optional[float] = None

class ReportMeasurementResponse(ReportMeasurementBase):
    id: UUID4
    report_id: UUID4
    user_id: UUID4
    created_at: datetime

    class Config:
        from_attributes = True

class ReportBase(BaseModel):
    file_path: str
    status: str
    file_hash: Optional[str] = None
    file_size: Optional[float] = None
    page_count: Optional[float] = None

class ReportResponse(ReportBase):
    id: UUID4
    user_id: UUID4
    metadata_json: Optional[Dict[str, Any]] = None
    extracted_entities: Optional[List[Dict[str, Any]]] = None
    patient_summary: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ReportListResponse(BaseModel):
    id: UUID4
    status: str
    file_size: Optional[float] = None
    page_count: Optional[float] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class ReportDetailResponse(ReportListResponse):
    measurements: List[ReportMeasurementResponse] = []
    patient_summary: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True
