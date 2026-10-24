
from fastapi import FastAPI
from pydantic import BaseModel, Field
from decision_engine import audit_decision

app = FastAPI(title="TrustChain AI")

class AuditRequest(BaseModel):
    evidence: list[str] = Field(default_factory=list)
    missing_info: list[str] = Field(default_factory=list)
    conflicts: list[str] = Field(default_factory=list)

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
    return audit_decision(case)
