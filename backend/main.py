
import json

from fastapi import FastAPI
from pydantic import BaseModel, Field, field_validator

from decision_engine import audit_decision
from database import get_connection, initialize_database

app = FastAPI(title="TrustChain AI")


class AuditRequest(BaseModel):
    evidence: list[str] = Field(default_factory=list, max_length=50)
    missing_info: list[str] = Field(default_factory=list, max_length=50)
    conflicts: list[str] = Field(default_factory=list, max_length=50)

    @field_validator("evidence", "missing_info", "conflicts")
    @classmethod
    def validate_items(cls, items: list[str]) -> list[str]:
        cleaned = [item.strip() for item in items]

        if any(not item for item in cleaned):
            raise ValueError("Items cannot be empty.")

        if any(len(item) > 2000 for item in cleaned):
            raise ValueError("Each item must be 2000 characters or fewer.")

        return cleaned


@app.on_event("startup")
def startup():
    initialize_database()


@app.get("/")
def home():
    return {
        "message": "Welcome to TrustChain AI!",
        "status": "Backend is running"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.post("/audit")
def audit(request: AuditRequest):
    case = request.model_dump()
    result = audit_decision(case)

    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO audits (
                evidence,
                missing_information,
                conflicting_evidence,
                decision,
                confidence,
                reason
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                json.dumps(result["evidence_used"]),
                json.dumps(result["missing_information"]),
                json.dumps(result["conflicting_evidence"]),
                result["decision"],
                result["confidence"],
                result["reason"],
            ),
        )
        audit_id = cursor.lastrowid

    return {"audit_id": audit_id, **result}


@app.get("/audits")
def get_audits():
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT * FROM audits
            ORDER BY id DESC
            """
        ).fetchall()

    return [
        {
            **dict(row),
            "evidence": json.loads(row["evidence"]),
            "missing_information": json.loads(row["missing_information"]),
            "conflicting_evidence": json.loads(row["conflicting_evidence"]),
        }
        for row in rows
    ]


@app.get("/audits/{audit_id}")
def get_audit(audit_id: int):
    with get_connection() as connection:
        row = connection.execute(
            "SELECT * FROM audits WHERE id = ?",
            (audit_id,),
        ).fetchone()

    if row is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Audit not found")

    result = dict(row)
    result["evidence"] = json.loads(result["evidence"])
    result["missing_information"] = json.loads(result["missing_information"])
    result["conflicting_evidence"] = json.loads(result["conflicting_evidence"])

    return result
