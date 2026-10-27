
def audit_decision(case: dict) -> dict:
    evidence = case.get("evidence", [])
    missing_info = case.get("missing_info", [])
    conflicts = case.get("conflicts", [])

    if not evidence:
        decision = "REVIEW"
        confidence = 0.30
        reason = "No supporting evidence was provided."

    elif conflicts and missing_info:
        decision = "REVIEW"
        confidence = 0.50
        reason = (
            "Conflicting evidence and missing information "
            "need review."
        )

    elif conflicts:
        decision = "REVIEW"
        confidence = 0.50
        reason = "Conflicting evidence needs investigation."

    elif missing_info:
        decision = "REVIEW"
        confidence = 0.50
        reason = "Required information is missing."

    else:
        decision = "REVIEW"
        confidence = 0.40
        reason = (
            "Evidence was submitted, but its validity and "
            "sufficiency have not been verified."
        )

    return {
        "decision": decision,
        "confidence": confidence,
        "evidence_used": evidence,
        "missing_information": missing_info,
        "conflicting_evidence": conflicts,
        "reason": reason,
        "warning": (
            "Demonstration rule-based result. "
            "Confidence values are illustrative, not validated probabilities."
        ),
    }
