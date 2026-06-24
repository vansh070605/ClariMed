from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional

class ShareGenerateRequest(BaseModel):
    report_id: Optional[UUID4] = None
    expires_in_days: int = 7

class ShareGenerateResponse(BaseModel):
    token: str
    expires_at: datetime
