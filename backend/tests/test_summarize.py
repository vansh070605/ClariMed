import pytest
from app.intelligence.summarizer import build_evidence_package, verify_summary_against_evidence, generate_patient_summary

def test_build_evidence_package():
    measurements = [
        {"biomarker_name": "hemoglobin", "value": 10.2, "status": "LOW", "severity": "MODERATE", "abnormal_flag": True},
        {"biomarker_name": "glucose", "value": 90, "status": "NORMAL", "severity": "NORMAL", "abnormal_flag": False},
        {"biomarker_name": "hdl", "value": 50, "status": "NORMAL", "severity": "NORMAL", "abnormal_flag": False}
    ]
    
    evidence = build_evidence_package(measurements)
    
    assert evidence["abnormal_measurement_count"] == 1
    assert evidence["normal_measurement_count"] == 2
    assert len(evidence["abnormal_measurements"]) == 1
    assert evidence["abnormal_measurements"][0]["biomarker"] == "hemoglobin"

def test_verify_summary_against_evidence():
    evidence = {
        "abnormal_measurements": [
            {"biomarker": "hemoglobin", "status": "LOW", "severity": "MODERATE"}
        ]
    }
    
    # Valid summary
    valid_summary = {
        "key_findings": [
            {
                "evidence": {"biomarker": "hemoglobin", "status": "LOW", "severity": "MODERATE"}
            }
        ]
    }
    assert verify_summary_against_evidence(valid_summary, evidence) is True
    
    # Hallucinated biomarker
    invalid_summary_1 = {
        "key_findings": [
            {
                "evidence": {"biomarker": "glucose", "status": "HIGH", "severity": "MILD"}
            }
        ]
    }
    assert verify_summary_against_evidence(invalid_summary_1, evidence) is False
    
    # Hallucinated severity
    invalid_summary_2 = {
        "key_findings": [
            {
                "evidence": {"biomarker": "hemoglobin", "status": "LOW", "severity": "SEVERE"}
            }
        ]
    }
    assert verify_summary_against_evidence(invalid_summary_2, evidence) is False

def test_generate_patient_summary_empty_abnormalities():
    measurements = [
        {"biomarker_name": "glucose", "value": 90, "abnormal_flag": False}
    ]
    summary = generate_patient_summary(measurements)
    assert summary.get("status") != "verification_failed"
    assert len(summary["key_findings"]) == 0
    assert "1 biomarkers were within" in summary["normal_findings"][0]

def test_generate_patient_summary_with_abnormalities():
    measurements = [
        {"biomarker_name": "hemoglobin", "value": 10.2, "status": "LOW", "severity": "MODERATE", "abnormal_flag": True}
    ]
    summary = generate_patient_summary(measurements)
    assert summary.get("status") != "verification_failed"
    assert len(summary["key_findings"]) == 1
    assert summary["key_findings"][0]["evidence"]["biomarker"] == "hemoglobin"
