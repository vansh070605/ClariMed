CATEGORY_MAPPINGS = {
    "hemoglobin": "CBC",
    "white_blood_cells": "CBC",
    "red_blood_cells": "CBC",
    "platelets": "CBC",
    "hba1c": "Diabetes",
    "glucose": "Diabetes",
    "tsh": "Thyroid",
    "ldl_cholesterol": "Lipid Profile",
    "hdl_cholesterol": "Lipid Profile",
}


def get_biomarker_category(name: str) -> str:
    """
    Maps a normalized biomarker name to a clinical category.
    Returns 'Other' if no mapping exists.
    """
    if not name:
        return "Other"

    return CATEGORY_MAPPINGS.get(name.lower(), "Other")
