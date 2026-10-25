
from unittest import result
from decision_engine import audit_decision


def test_no_evidence_returns_review():
    result = audit_decision({
        "evidence": [],
        "missing_info": [],
        "conflicts": [],
    })
    assert result["decision"] == "REVIEW"


def test_missing_information_returns_review():
    result = audit_decision({
        "evidence": ["Invoice provided"],
        "missing_info": ["Proof of delivery"],
        "conflicts": [],
    })
    assert result["decision"] == "REVIEW"


def test_conflicting_evidence_returns_review():
    result = audit_decision({
        "evidence": ["Invoice provided"],
        "missing_info": [],
        "conflicts": ["Date mismatch"],
    })
    assert result["decision"] == "REVIEW"


def test_unverified_evidence_returns_review():
    result = audit_decision({
        "evidence": ["Invoice provided"],
        "missing_info": [],
        "conflicts": [],
    })
    assert result["decision"] == "REVIEW"
    assert "Confidence values are illustrative" in result["warning"]