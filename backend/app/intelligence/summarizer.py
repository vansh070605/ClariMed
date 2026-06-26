import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


def build_evidence_package(measurements: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Builds a compact evidence package to minimize LLM tokens.
    Only includes abnormal measurements.
    """
    abnormal_measurements = []
    normal_count = 0

    for m in measurements:
        # Check abnormal flag
        if m.get("abnormal_flag"):
            # Only keep essential fields
            abnormal_measurements.append(
                {
                    "biomarker": m.get("biomarker_name"),
                    "status": m.get("status"),
                    "severity": m.get("severity"),
                    "value": m.get("value"),
                    "reference_low": m.get("reference_low"),
                    "reference_high": m.get("reference_high"),
                }
            )
        else:
            normal_count += 1

    return {
        "report_type": "Blood Test",  # Defaulted for MVP
        "abnormal_measurements": abnormal_measurements,
        "normal_measurement_count": normal_count,
        "abnormal_measurement_count": len(abnormal_measurements),
    }


def verify_summary_against_evidence(
    summary: Dict[str, Any], evidence: Dict[str, Any]
) -> bool:
    """
    Validates that the generated summary does not hallucinate biomarkers or severity.
    """
    # Build a set of allowed abnormal biomarkers from evidence
    allowed_biomarkers = {
        m["biomarker"].lower(): m
        for m in evidence.get("abnormal_measurements", [])
        if "biomarker" in m
    }

    key_findings = summary.get("key_findings", [])
    for finding in key_findings:
        ev = finding.get("evidence", {})
        biomarker = ev.get("biomarker", "").lower()

        # Rule 1: Biomarker must exist in abnormal evidence
        if biomarker not in allowed_biomarkers:
            logger.error(
                f"Hallucination detected: Biomarker '{biomarker}' not in evidence."
            )
            return False

        allowed = allowed_biomarkers[biomarker]

        # Rule 2: Severity must match evidence
        if ev.get("severity") != allowed.get("severity"):
            logger.error(
                f"Hallucination detected: Severity mismatch for '{biomarker}'."
            )
            return False

        # Rule 3: Status must match evidence
        if ev.get("status") != allowed.get("status"):
            logger.error(f"Hallucination detected: Status mismatch for '{biomarker}'.")
            return False

    return True


def mock_llm_call(evidence: Dict[str, Any]) -> Dict[str, Any]:
    """
    Mocks the LLM response for development.
    In the next phase, this will be replaced with an actual Google GenAI or OpenAI call.
    """
    findings = []
    for m in evidence.get("abnormal_measurements", []):
        findings.append(
            {
                "title": f"Abnormal {m['biomarker'].title()}",
                "explanation": f"The level of {m['biomarker']} is {m['status'].lower()}, which may suggest an underlying issue. Please discuss this with your doctor.",
                "evidence": {
                    "biomarker": m["biomarker"],
                    "value": m["value"],
                    "status": m["status"],
                    "severity": m["severity"],
                },
            }
        )

    normal_count = evidence.get("normal_measurement_count", 0)

    return {
        "overall_assessment": "The report shows some abnormal measurements that require attention.",
        "key_findings": findings,
        "normal_findings": [
            f"{normal_count} biomarkers were within their reported reference ranges."
        ],
        "follow_up_considerations": [
            "Discuss these findings with your healthcare professional."
        ],
        "disclaimer": "This summary is informational and is not a diagnosis.",
    }


def generate_patient_summary(measurements: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generates an evidence-backed patient summary.
    """
    # 1. Build strict evidence payload (Cost Optimization)
    evidence = build_evidence_package(measurements)

    # 2. Call LLM (Mocked for now as per constraints)
    summary = mock_llm_call(evidence)

    # 3. Hallucination Protection
    is_valid = verify_summary_against_evidence(summary, evidence)
    if not is_valid:
        return {"status": "verification_failed"}

    return summary
