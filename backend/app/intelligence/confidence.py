from typing import Dict, Any


def generate_confidence_scores(measurement: Dict[str, Any]) -> Dict[str, float]:
    """
    Generates deterministic confidence scores based on data completeness.

    Rules:
    - Parsed value present: baseline 0.5
    - Unit present: +0.15
    - Reference low present: +0.15
    - Reference high present: +0.15
    - Named perfectly matched canonical: +0.05
    """
    value_conf = 0.0
    ref_conf = 0.0

    value = measurement.get("value")
    unit = measurement.get("unit")
    ref_low = measurement.get("reference_low")
    ref_high = measurement.get("reference_high")

    if value is not None:
        value_conf += 0.8
    if unit:
        value_conf += 0.2

    if ref_low is not None:
        ref_conf += 0.5
    if ref_high is not None:
        ref_conf += 0.5

    # Overall confidence is a weighted average favoring value over references
    overall_confidence = (value_conf * 0.6) + (ref_conf * 0.4)

    scores = {
        "value_confidence": round(value_conf, 2),
        "reference_confidence": round(ref_conf, 2),
        "overall_confidence": round(overall_confidence, 2),
    }

    # Attach to measurement for JSON representation
    measurement["confidence"] = scores
    measurement["overall_confidence"] = scores["overall_confidence"]

    return scores
