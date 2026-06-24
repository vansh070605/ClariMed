import pytest
from app.trends.analyzer import classify_trend

def test_trend_classification_improving_standard():
    # Standard: higher is better, increased by 10%
    assert classify_trend(10.0, "HIGHER") == "IMPROVING"

def test_trend_classification_declining_standard():
    # Standard: higher is better, decreased by 10%
    assert classify_trend(-10.0, "HIGHER") == "DECLINING"

def test_trend_classification_stable():
    # Stable: changes within [-5%, 5%]
    assert classify_trend(4.9, "HIGHER") == "STABLE"
    assert classify_trend(-4.9, "LOWER") == "STABLE"
    assert classify_trend(0.0, "LOWER") == "STABLE"

def test_trend_classification_inverted_direction():
    # Inverted: lower is better (e.g., HbA1c)
    # Decreased by 10% -> Improving
    assert classify_trend(-10.0, "LOWER") == "IMPROVING"
    
    # Increased by 10% -> Declining
    assert classify_trend(10.0, "LOWER") == "DECLINING"

def test_trend_classification_default():
    # No direction specified: default to higher is better
    assert classify_trend(10.0, None) == "IMPROVING"
    assert classify_trend(-10.0, None) == "DECLINING"
