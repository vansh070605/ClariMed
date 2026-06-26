from typing import List, Dict, Any, Tuple
import logging

logger = logging.getLogger(__name__)


def validate_measurements(
    measurements: List[Dict[str, Any]],
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Validates measurement rows and categorizes them into Valid/Partial and Invalid.
    Returns (accepted_measurements, dropped_measurements).

    Rules:
    Valid: biomarker_name, value, reference_low, reference_high exist.
    Partial: biomarker_name, value exist, but references are missing.
    Invalid: missing name, missing value, or malformed.
    """
    accepted = []
    dropped = []

    for row in measurements:
        name = row.get("biomarker_name")
        value = row.get("value")
        row.get("reference_low")
        row.get("reference_high")

        # Invalid check
        if not name or value is None:
            dropped.append(row)
            continue

        # If it reaches here, it's either Valid or Partial
        # We will determine abnormal_flag in evaluation.py, so we just pass it along
        accepted.append(row)

    logger.info(
        f"Validated {len(accepted)} measurements. Dropped {len(dropped)} invalid measurements."
    )
    return accepted, dropped
