import re
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Basic regex for a line like: "Hemoglobin 14.5 g/dL 13.0 - 17.0"
# Or "Glucose 95 mg/dL 70-100"
# This is a highly simplified regex for MVP demonstration.
BIOMARKER_REGEX = re.compile(
    r"(?P<name>[A-Za-z\s\(\)\-]+?)\s+"  # Biomarker name
    r"(?P<value>\d+\.?\d*)\s*"  # Value
    r"(?P<unit>[a-zA-Z/%]+)?\s*"  # Optional unit
    r"(?:(?P<ref_low>\d+\.?\d*)\s*[-|to]\s*(?P<ref_high>\d+\.?\d*))?"  # Optional ref range
)


def extract_measurements_from_text(raw_text: str) -> List[Dict[str, Any]]:
    """
    Deterministically extracts medical measurements from raw text using Regex.
    """
    measurements = []

    if not raw_text:
        return measurements

    for line in raw_text.split("\n"):
        line = line.strip()
        if not line:
            continue

        match = BIOMARKER_REGEX.search(line)
        if match:
            group_dict = match.groupdict()

            # Clean up the name
            name = group_dict.get("name", "").strip()
            if len(name) < 2 or name.lower() in [
                "page",
                "report",
                "date",
                "patient",
                "age",
            ]:
                continue

            value = group_dict.get("value")
            unit = group_dict.get("unit")
            ref_low = group_dict.get("ref_low")
            ref_high = group_dict.get("ref_high")

            try:
                measurements.append(
                    {
                        "biomarker_name": name,
                        "value": float(value) if value else None,
                        "unit": unit.strip() if unit else None,
                        "reference_low": float(ref_low) if ref_low else None,
                        "reference_high": float(ref_high) if ref_high else None,
                    }
                )
            except ValueError:
                logger.warning(f"Could not parse numeric values in line: {line}")
                continue

    return measurements
