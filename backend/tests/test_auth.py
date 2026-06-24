import pytest
from fastapi.testclient import TestClient
from app.main import app
import uuid

client = TestClient(app)

def generate_test_email():
    return f"test_{uuid.uuid4()}@example.com"

def test_successful_registration():
    email = generate_test_email()
    response = client.post(
        "/auth/register",
        json={"name": "Test User", "email": email, "password": "securepassword123"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == email
    assert "id" in data
    assert "password" not in data
    assert "password_hash" not in data

def test_duplicate_email_registration():
    email = generate_test_email()
    payload = {"name": "Test User", "email": email, "password": "securepassword123"}
    
    # First registration
    response1 = client.post("/auth/register", json=payload)
    assert response1.status_code == 201
    
    # Second registration with same email
    response2 = client.post("/auth/register", json=payload)
    assert response2.status_code == 400
    assert response2.json()["detail"] == "Email already registered"

def test_successful_login():
    email = generate_test_email()
    password = "securepassword123"
    
    # Register first
    client.post("/auth/register", json={"name": "Test User", "email": email, "password": password})
    
    # Login
    response = client.post(
        "/auth/login",
        data={"username": email, "password": password}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_invalid_password_login():
    email = generate_test_email()
    password = "securepassword123"
    
    client.post("/auth/register", json={"name": "Test User", "email": email, "password": password})
    
    response = client.post(
        "/auth/login",
        data={"username": email, "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"

def test_invalid_email_login():
    response = client.post(
        "/auth/login",
        data={"username": "nonexistent@example.com", "password": "password123"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"

def test_protected_route_access():
    email = generate_test_email()
    password = "securepassword123"
    
    client.post("/auth/register", json={"name": "Test User", "email": email, "password": password})
    login_response = client.post("/auth/login", data={"username": email, "password": password})
    token = login_response.json()["access_token"]
    
    response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == email

def test_unauthorized_access():
    # No token
    response1 = client.get("/auth/me")
    assert response1.status_code == 401
    
    # Invalid token
    response2 = client.get(
        "/auth/me",
        headers={"Authorization": "Bearer invalidtoken123"}
    )
    assert response2.status_code == 401
