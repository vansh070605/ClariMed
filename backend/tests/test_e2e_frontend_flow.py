import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import uuid

from app.main import app
from app.database.session import get_db
from app.database.base import Base


# Use SQLite for fast E2E validation in memory
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_e2e.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    return TestClient(app)

def test_scenario_1_to_5_e2e_flow(client):
    """
    Scenario 1: New User Journey
    Scenario 2: Multiple Report Journey
    Scenario 3: Delete Workflow
    Scenario 4: Dashboard Integrity
    Scenario 5: Failure States
    """
    import io
    
    # 1. Register & Login
    email = "e2e@example.com"
    password = "securepassword123"
    
    res = client.post("/auth/register", json={"email": email, "password": password})
    assert res.status_code == 200
    
    res = client.post("/auth/login", data={"username": email, "password": password})
    assert res.status_code == 200
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Empty States (Scenario 5)
    res = client.get("/reports", headers=headers)
    assert res.json() == []
    
    res = client.get("/dashboard", headers=headers)
    assert res.json()["total_reports"] == 0
    
    # 2. Upload Report A
    pdf_content_a = b"Hemoglobin 14.2 g/dL. HbA1c 5.4%."
    files = {"file": ("reportA.pdf", io.BytesIO(pdf_content_a), "application/pdf")}
    res = client.post("/reports/upload", files=files, headers=headers)
    assert res.status_code == 200
    report_a_id = res.json()["id"]
    
    # Analyze & Summarize Report A
    res = client.post(f"/reports/{report_a_id}/analyze", headers=headers)
    assert res.status_code == 200
    res = client.post(f"/reports/{report_a_id}/summarize", headers=headers)
    assert res.status_code == 200
    
    # Validate Report Details
    res = client.get(f"/reports/{report_a_id}", headers=headers)
    report_a = res.json()
    assert report_a["status"] == "summarized"
    assert len(report_a["measurements"]) > 0
    assert report_a["patient_summary"] is not None
    
    # Upload Report B (Scenario 2)
    pdf_content_b = b"Hemoglobin 13.0 g/dL. HbA1c 6.5%." # Declining hgb, worsening hba1c
    files = {"file": ("reportB.pdf", io.BytesIO(pdf_content_b), "application/pdf")}
    res = client.post("/reports/upload", files=files, headers=headers)
    report_b_id = res.json()["id"]
    client.post(f"/reports/{report_b_id}/analyze", headers=headers)
    client.post(f"/reports/{report_b_id}/summarize", headers=headers)
    
    # Verify GET /reports shows both
    res = client.get("/reports", headers=headers)
    reports = res.json()
    assert len(reports) == 2
    
    # Verify GET /trends
    res = client.get("/trends", headers=headers)
    trends = res.json()
    assert trends["total_reports"] == 2
    assert len(trends["trends"]) > 0
    
    # Scenario 4: Dashboard Integrity
    res = client.get("/dashboard", headers=headers)
    dash = res.json()
    assert dash["total_reports"] == 2
    assert dash["abnormal_findings"] >= 0
    
    # Scenario 3: Delete Workflow
    res = client.delete(f"/reports/{report_a_id}", headers=headers)
    assert res.status_code == 200
    
    # Verify report A is inaccessible
    res = client.get(f"/reports/{report_a_id}", headers=headers)
    assert res.status_code == 404
    
    # Verify lists update
    res = client.get("/reports", headers=headers)
    assert len(res.json()) == 1
    
    res = client.get("/dashboard", headers=headers)
    assert res.json()["total_reports"] == 1
    
    print("E2E VALIDATION PASS SUCCESSFUL")
