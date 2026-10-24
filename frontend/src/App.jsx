
import { useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [evidence, setEvidence] = useState(
    "Identity verified\nAddress verified"
  );
  const [missingInfo, setMissingInfo] = useState("");
  const [conflicts, setConflicts] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runAudit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const toList = (value) =>
      value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

    try {
      const response = await fetch(`${API_URL}/audit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          evidence: toList(evidence),
          missing_info: toList(missingInfo),
          conflicts: toList(conflicts),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
  console.error("Audit error:", err);
  setError(err.message || "Something went wrong.");
} finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <nav className="topbar">
        <div className="brand">
          <span className="brand-mark">T</span>
          <span>TrustChain <b>AI</b></span>
        </div>
        <span className="status">
          <span className="status-dot" /> DEMO ENVIRONMENT
        </span>
      </nav>

      <section className="hero">
        <p className="eyebrow">EVIDENCE-BASED DECISION SUPPORT</p>
        <h1>Trust decisions.<br /><span>Made transparent.</span></h1>
        <p className="hero-copy">
          Review evidence, identify missing information, and surface
          conflicting details with a transparent, explainable audit.
        </p>
      </section>

      <section className="workspace">
        <form className="panel form-panel" onSubmit={runAudit}>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">01 / INPUT</p>
              <h2>Evidence audit</h2>
            </div>
            <span className="step-number">01</span>
          </div>

          <label htmlFor="evidence">Evidence provided</label>
          <textarea
            id="evidence"
            value={evidence}
            onChange={(event) => setEvidence(event.target.value)}
            placeholder={"Identity verified\nAddress verified"}
            rows={4}
          />

          <label htmlFor="missing">Missing information</label>
          <textarea
            id="missing"
            value={missingInfo}
            onChange={(event) => setMissingInfo(event.target.value)}
            placeholder="Enter one item per line"
            rows={3}
          />

          <label htmlFor="conflicts">Conflicting evidence</label>
          <textarea
            id="conflicts"
            value={conflicts}
            onChange={(event) => setConflicts(event.target.value)}
            placeholder="Example: Address details do not match"
            rows={3}
          />

          <p className="field-hint">
            Enter each item on a separate line.
          </p>

          <button className="audit-button" type="submit" disabled={loading}>
            {loading ? "Analyzing evidence..." : "Run evidence audit →"}
          </button>

          {error && <p className="error-message">{error}</p>}
        </form>

        <section className="panel result-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">02 / OUTPUT</p>
              <h2>Audit result</h2>
            </div>
            <span className="step-number">02</span>
          </div>

          {!result && !loading && (
            <div className="empty-state">
              <div className="empty-icon">↗</div>
              <h3>Awaiting audit</h3>
              <p>
                Submit evidence to see the decision, confidence score,
                and explanation returned by the backend.
              </p>
            </div>
          )}

          {loading && <p className="field-hint">Waiting for the backend...</p>}

          {result && (
            <div className="result-content">
              <p className="result-label">DECISION</p>
              <h3 className={`decision decision-${String(result.decision).toLowerCase()}`}>
                {result.decision}
              </h3>

              <p className="result-label">REPORTED CONFIDENCE</p>
              <div className="confidence-row">
                <strong>
                  {Math.round(Number(result.confidence) * 100)}%
                </strong>
                <span>Rule-based score</span>
              </div>
              <div className="confidence-track">
                <div
                  className="confidence-fill"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, Number(result.confidence) * 100)
                    )}%`,
                  }}
                />
              </div>

              <div className="detail-block">
                <h4>Reason</h4>
                <p>{result.reason || "No explanation provided."}</p>
              </div>

              <div className="detail-block">
                <h4>Evidence used</h4>
                {result.evidence_used?.length ? (
                  <ul>
                    {result.evidence_used.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No evidence listed.</p>
                )}
              </div>

              <div className="detail-block">
                <h4>Missing information</h4>
                {result.missing_information?.length ? (
                  <ul>
                    {result.missing_information.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p>None reported.</p>
                )}
              </div>

              <div className="detail-block">
                <h4>Conflicting evidence</h4>
                {result.conflicting_evidence?.length ? (
                  <ul>
                    {result.conflicting_evidence.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p>None reported.</p>
                )}
              </div>

              <p className="warning-message">
                {result.warning ||
                  "Demonstration only. This result is not a validated AI prediction."}
              </p>
            </div>
          )}
        </section>
      </section>

      <footer>
        TRUSTCHAIN AI · TRANSPARENT BY DESIGN
      </footer>
    </main>
  );
}

export default App;
