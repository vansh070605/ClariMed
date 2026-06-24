import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import get_db
from app.auth.dependencies import get_current_user
from app.database.models import User, Report, ReportMeasurement
import uuid
from datetime import datetime, timezone, timedelta

def override_get_current_user():
    return User(id=uuid.UUID("12345678-1234-5678-1234-567812345678"), email="test@test.com")

app.dependency_overrides[get_current_user] = override_get_current_user

class MockQuery:
    def __init__(self, items):
        self.items = items
    def filter(self, *args, **kwargs):
        return self
    def order_by(self, *args, **kwargs):
        return self
    def all(self):
        return self.items

class MockSession:
    def __init__(self, empty=False):
        self.empty = empty
    def query(self, model):
        if self.empty:
            return MockQuery([])
            
        base_time = datetime.now(timezone.utc)
        
        # We will mock the ReportMeasurement data to test analyze_biomarker_trends
        r_id1 = uuid.uuid4()
        r_id2 = uuid.uuid4()
        m1 = ReportMeasurement(
            user_id=uuid.UUID("12345678-1234-5678-1234-567812345678"),
            report_id=r_id1,
            biomarker_name="hba1c",
            value=7.5,
            created_at=base_time - timedelta(days=60)
        )
        m2 = ReportMeasurement(
            user_id=uuid.UUID("12345678-1234-5678-1234-567812345678"),
            report_id=r_id2,
            biomarker_name="hba1c",
            value=6.2, # Improved (decreased by > 5%)
            created_at=base_time - timedelta(days=30)
        )
        m3 = ReportMeasurement(
            user_id=uuid.UUID("12345678-1234-5678-1234-567812345678"),
            report_id=r_id1,
            biomarker_name="hemoglobin",
            value=10.0,
            created_at=base_time - timedelta(days=60)
        )
        return MockQuery([m1, m2, m3])
        
    def add(self, obj):
        pass
    def commit(self):
        pass

def override_get_db():
    yield MockSession()
    
def override_get_db_empty():
    yield MockSession(empty=True)

client = TestClient(app)

def test_get_trends_endpoint():
    app.dependency_overrides[get_db] = override_get_db
    
    response = client.get("/trends")
    assert response.status_code == 200
    data = response.json()
    
    assert data["total_reports"] == 2 # 2 unique report_ids generated
    assert data["tracked_biomarkers"] == 2
    
    hba1c_trend = next(t for t in data["trends"] if t["biomarker"] == "hba1c")
    assert hba1c_trend["classification"] == "IMPROVING" # Inverted logic
    assert hba1c_trend["change_percent"] < -5.0
    
    hemo_trend = next(t for t in data["trends"] if t["biomarker"] == "hemoglobin")
    assert hemo_trend["classification"] == "INSUFFICIENT_DATA" # Only 1 datapoint

def test_get_trends_empty_history():
    app.dependency_overrides[get_db] = override_get_db_empty
    
    response = client.get("/trends")
    assert response.status_code == 200
    data = response.json()
    
    assert data["total_reports"] == 0
    assert data["tracked_biomarkers"] == 0
    assert len(data["trends"]) == 0
