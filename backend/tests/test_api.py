
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_audit_accepts_valid_input():
    response = client.post(
        "/audit",
        json={
            "evidence": ["Invoice provided"],
            "missing_info": [],
            "conflicts": [],
        },
    )

    assert response.status_code == 200
    assert response.json()["decision"] == "REVIEW"


def test_audit_rejects_whitespace_only_item():
    response = client.post(
        "/audit",
        json={
            "evidence": ["   "],
            "missing_info": [],
            "conflicts": [],
        },
    )

    assert response.status_code == 422


def test_audit_rejects_item_over_2000_characters():
    response = client.post(
        "/audit",
        json={
            "evidence": ["a" * 2001],
            "missing_info": [],
            "conflicts": [],
        },
    )

    assert response.status_code == 422


def test_audit_rejects_more_than_50_items():
    response = client.post(
        "/audit",
        json={
            "evidence": [f"Evidence {i}" for i in range(51)],
            "missing_info": [],
            "conflicts": [],
        },
    )

    assert response.status_code == 422
