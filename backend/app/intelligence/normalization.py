BIOMARKER_ALIASES = {
    "hb": "hemoglobin",
    "hgb": "hemoglobin",
    "haemoglobin": "hemoglobin",
    "hemoglobin": "hemoglobin",

    "wbc": "white_blood_cells",
    "white blood cells": "white_blood_cells",

    "rbc": "red_blood_cells",
    "red blood cells": "red_blood_cells",

    "hba1c": "hba1c",

    "tsh": "tsh",

    "ldl": "ldl_cholesterol",
    "hdl": "hdl_cholesterol",
    "glucose": "glucose",
    "platelets": "platelets",
}

def normalize_biomarker_name(name: str) -> str:
    """
    Normalizes a raw biomarker name to a canonical string using a dictionary mapping.
    Unknown biomarkers are trimmed and passed through in lowercase.
    """
    if not name:
        return name
        
    cleaned_name = name.strip().lower()
    
    # Simple pass to handle exact match
    if cleaned_name in BIOMARKER_ALIASES:
        return BIOMARKER_ALIASES[cleaned_name]
        
    # Attempt substring or space removal match if needed,
    # but for deterministic MVP we stick to exact alias match.
    return cleaned_name
