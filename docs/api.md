# API Documentation

The ClariMed API is built with FastAPI and strictly requires secure, `HttpOnly` cookie-based authentication for all protected routes.

## 1. Authentication

### `POST /auth/register`
- **Purpose:** Registers a new user.
- **Request:** `{"email": "user@example.com", "password": "secure123"}`
- **Response:** `201 Created` with User object. Sets `access_token` HttpOnly cookie.

### `POST /auth/login`
- **Purpose:** Authenticates a user.
- **Request (Form Data):** `username=user@example.com&password=secure123`
- **Response:** `{"message": "Successfully logged in"}`. Sets `access_token` HttpOnly cookie.
- **Common Errors:** `401 Unauthorized` (Incorrect email or password).

### `GET /auth/me`
- **Purpose:** Fetches the currently authenticated user session.
- **Auth:** Required.
- **Response:** `{"id": "uuid", "email": "user@example.com", "is_active": true}`

### `POST /auth/logout`
- **Purpose:** Invalidates the current session.
- **Response:** `{"message": "Successfully logged out"}`. Clears the `access_token` cookie.

---

## 2. Reports

### `GET /reports`
- **Purpose:** Lists all reports uploaded by the authenticated user.
- **Auth:** Required.
- **Response:** `[ { "id": "uuid", "status": "summarized", "file_size": 2048, "created_at": "..." } ]`

### `POST /reports/upload`
- **Purpose:** Uploads a raw PDF lab report.
- **Auth:** Required.
- **Request:** `multipart/form-data` with a `file` field.
- **Response:** `{"id": "uuid", "status": "uploaded", ...}`

### `GET /reports/{id}`
- **Purpose:** Retrieves the full details of a report, including its deterministic measurements and AI summaries.
- **Auth:** Required.
- **Response:** 
```json
{
  "id": "uuid",
  "status": "summarized",
  "measurements": [
    { "biomarker_name": "Hemoglobin", "value": 14.2, "unit": "g/dL", "abnormal_flag": false }
  ],
  "patient_summary": {
    "overall_assessment": "...",
    "key_findings": [...]
  }
}
```

---

## 3. Intelligence Pipeline

### `POST /reports/{id}/analyze`
- **Purpose:** Triggers the deterministic rule-based extractor to parse the PDF and evaluate reference ranges.

### `POST /reports/{id}/summarize`
- **Purpose:** Triggers the LLM generation phase to convert the structured interpretations into a patient-friendly summary.

---

## 4. Dashboard & Trends

### `GET /dashboard`
- **Purpose:** Fetches KPI metrics for the user overview.
- **Response:** `{"total_reports": 3, "abnormal_findings": 2, "improving_trends": 1, "recent_reports": [...]}`

### `GET /trends`
- **Purpose:** Fetches historic, longitudinal biomarker data formatted for Recharts.
- **Response:** 
```json
{
  "trends": [
    { "date": "Jan 15", "Hemoglobin": 11.2, "HbA1c": 8.4 },
    { "date": "Apr 20", "Hemoglobin": 12.0, "HbA1c": 7.2 }
  ]
}
```
