import pytest
from app.intelligence.normalization import normalize_biomarker_name
from app.intelligence.categories import get_biomarker_category
from app.intelligence.interpreter import interpret_measurement, apply_interpretation
from app.intelligence.confidence import generate_confidence_scores

def test_normalization():
    assert normalize_biomarker_name("Hb") == "hemoglobin"
    assert normalize_biomarker_name(" HGB ") == "hemoglobin"
    assert normalize_biomarker_name("White Blood Cells") == "white_blood_cells"
    assert normalize_biomarker_name("Unknown_Marker") == "unknown_marker"
    assert normalize_biomarker_name("") == ""
    assert normalize_biomarker_name(None) is None

def test_categories():
    assert get_biomarker_category("hemoglobin") == "CBC"
    assert get_biomarker_category("hba1c") == "Diabetes"
    assert get_biomarker_category("unknown_marker") == "Other"
    assert get_biomarker_category("") == "Other"

def test_interpretation_severity_logic():
    # Normal
    res1 = interpret_measurement(15.0, 13.0, 17.0)
    assert res1["status"] == "NORMAL"
    assert res1["severity"] == "NORMAL"
    assert res1["delta_percent"] == 0.0
    
    # Low Mild
    # 13.0 - 12.0 = 1.0; 1.0 / 13.0 = 7.69%
    res2 = interpret_measurement(12.0, 13.0, 17.0)
    assert res2["status"] == "LOW"
    assert res2["severity"] == "MILD"
    assert res2["delta_percent"] == 7.69
    
    # Low Moderate
    # 13.0 - 10.0 = 3.0; 3.0 / 13.0 = 23.08%
    res3 = interpret_measurement(10.0, 13.0, 17.0)
    assert res3["status"] == "LOW"
    assert res3["severity"] == "MODERATE"
    assert res3["delta_percent"] == 23.08
    
    # High Severe
    # 105 - 100 = 5.0; 5.0 / 100 = 5%
    # wait let's do Severe: >25%
    # 130 - 100 = 30; 30 / 100 = 30%
    res4 = interpret_measurement(130.0, 70.0, 100.0)
    assert res4["status"] == "HIGH"
    assert res4["severity"] == "SEVERE"
    assert res4["delta_percent"] == 30.0

def test_confidence_scoring():
    # Perfect
    m1 = {"value": 15.0, "unit": "g/dL", "reference_low": 13.0, "reference_high": 17.0}
    scores1 = generate_confidence_scores(m1)
    assert scores1["value_confidence"] == 1.0
    assert scores1["reference_confidence"] == 1.0
    assert scores1["overall_confidence"] == 1.0
    
    # Missing unit
    m2 = {"value": 15.0, "reference_low": 13.0, "reference_high": 17.0}
    scores2 = generate_confidence_scores(m2)
    assert scores2["value_confidence"] == 0.8
    assert scores2["reference_confidence"] == 1.0
    # overall = 0.8 * 0.6 + 1.0 * 0.4 = 0.48 + 0.40 = 0.88
    assert scores2["overall_confidence"] == 0.88
    
    # Missing reference high
    m3 = {"value": 15.0, "unit": "g/dL", "reference_low": 13.0}
    scores3 = generate_confidence_scores(m3)
    assert scores3["value_confidence"] == 1.0
    assert scores3["reference_confidence"] == 0.5
    # overall = 1.0 * 0.6 + 0.5 * 0.4 = 0.6 + 0.2 = 0.80
    assert scores3["overall_confidence"] == 0.80
