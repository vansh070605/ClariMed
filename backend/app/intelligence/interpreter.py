from typing import Dict, Any, Optional

def interpret_measurement(value: float, ref_low: float, ref_high: float) -> Dict[str, Any]:
    """
    Deterministically interprets a measurement's severity and deviation percent.
    
    Returns:
        {
            "status": "NORMAL" | "LOW" | "HIGH",
            "severity": "NORMAL" | "MILD" | "MODERATE" | "SEVERE",
            "delta_percent": float
        }
    """
    
    # Check for Normal
    if ref_low <= value <= ref_high:
        return {
            "status": "NORMAL",
            "severity": "NORMAL",
            "delta_percent": 0.0
        }
        
    deviation = 0.0
    status = ""
    
    if value < ref_low:
        status = "LOW"
        if ref_low > 0:
            deviation = (ref_low - value) / ref_low
    elif value > ref_high:
        status = "HIGH"
        if ref_high > 0:
            deviation = (value - ref_high) / ref_high
            
    delta_percent = deviation * 100.0
    
    # Severity bands based on deviation percent
    severity = "NORMAL"
    if 0 < delta_percent <= 10.0:
        severity = "MILD"
    elif 10.0 < delta_percent <= 25.0:
        severity = "MODERATE"
    elif delta_percent > 25.0:
        severity = "SEVERE"
        
    # Standardize precision to 2 decimal places, but we can return float
    return {
        "status": status,
        "severity": severity,
        "delta_percent": round(delta_percent, 2)
    }

def apply_interpretation(measurement: Dict[str, Any]) -> Dict[str, Any]:
    """
    In-place interprets a validated measurement dictionary if it has references.
    """
    value = measurement.get("value")
    ref_low = measurement.get("reference_low")
    ref_high = measurement.get("reference_high")
    
    if value is not None and ref_low is not None and ref_high is not None:
        interpretation = interpret_measurement(value, ref_low, ref_high)
        measurement["status"] = interpretation["status"]
        measurement["severity"] = interpretation["severity"]
        measurement["delta_percent"] = interpretation["delta_percent"]
    else:
        measurement["status"] = None
        measurement["severity"] = None
        measurement["delta_percent"] = None
        
    return measurement
