from typing import List, Dict, Any

def evaluate_measurements(measurements: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Deterministically evaluates abnormal flags for measurements.
    If reference ranges are missing (Partial state), abnormal_flag remains None.
    """
    evaluated = []
    
    for row in measurements:
        value = row.get("value")
        ref_low = row.get("reference_low")
        ref_high = row.get("reference_high")
        
        abnormal_flag = None
        
        if value is not None and ref_low is not None and ref_high is not None:
            if value < ref_low or value > ref_high:
                abnormal_flag = True
            else:
                abnormal_flag = False
                
        row["abnormal_flag"] = abnormal_flag
        evaluated.append(row)
        
    return evaluated
