import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import get_db
from app.auth.dependencies import get_current_user
from app.database.models import User, Report, ReportMeasurement
import uuid
from datetime import datetime, timezone

user_uuid = uuid.uuid4()

def override_get_current_user():
    return User(id=user_uuid, email="test@test.com")

class MockQuery:
    def __init__(self, items):
        self.items = items
    def filter(self, *args, **kwargs):
        return self
    def order_by(self, *args, **kwargs):
        return self
    def offset(self, *args, **kwargs):
        return self
    def limit(self, *args, **kwargs):
        return self
    def all(self):
        return self.items
    def first(self):
        return self.items[0] if self.items else None
    def count(self):
        return len(self.items)
    def delete(self):
        pass

class MockSession:
    def __init__(self, items_dict):
        self.items_dict = items_dict
    def query(self, model):
        return MockQuery(self.items_dict.get(model.__name__, []))
    def delete(self, obj):
        pass
    def commit(self):
        pass

base_time = datetime.now(timezone.utc)
r_id = uuid.uuid4()
mock_report = Report(
    id=r_id,
    user_id=user_uuid,
    status="parsed",
    file_size=1024,
    page_count=1,
    created_at=base_time
)
mock_measurement = ReportMeasurement(
    id=uuid.uuid4(),
    report_id=r_id,
    user_id=user_uuid,
    biomarker_name="hba1c",
    value=7.5,
    abnormal_flag=True,
    created_at=base_time
)

def override_get_db():
    yield MockSession({"Report": [mock_report], "ReportMeasurement": [mock_measurement]})

app.dependency_overrides[get_current_user] = override_get_current_user
app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

def test_reports_list():
    response = client.get("/reports")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == str(r_id)

def test_report_details():
    response = client.get(f"/reports/{r_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(r_id)
    assert len(data["measurements"]) == 1
    assert data["measurements"][0]["biomarker_name"] == "hba1c"

def test_delete_report():
    response = client.delete(f"/reports/{r_id}")
    assert response.status_code == 200
    assert response.json()["status"] == "deleted"

def test_dashboard():
    response = client.get("/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert data["total_reports"] == 1
    assert data["abnormal_findings"] == 1

def test_trends_history():
    response = client.get("/trends/history")
    assert response.status_code == 200
    data = response.json()
    assert "hba1c" in data
    assert len(data["hba1c"]) == 1
    assert data["hba1c"][0]["value"] == 7.5
