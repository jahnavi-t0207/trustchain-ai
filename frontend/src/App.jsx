
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

  const toList = (value) =>
    value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

  async function runAudit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

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
        let message = `Server returned error ${response.status}`;

        try {
          const data = await response.json();

          if (Array.isArray(data.detail)) {
            message = data.detail
              .map((item) => item.msg)
              .join(". ");
          } else if (typeof data.detail === "string") {
            message = data.detail;
          }
        } catch {
          // Keep the default message if the response isn't JSON.
        }

        throw new Error(message);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Audit error:", err);

      if (err instanceof TypeError) {
        setError(
          "Could not connect to the backend. Check that the API is running."
        );
      } else {
        setError(err.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }

  function renderList(items, emptyMessage) {
    if (!Array.isArray(items) || items.length === 0) {
      return <p>{emptyMessage}</p>;
    }

    return (
      <ul>
        {items.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    );
  }

  const confidence = Number(result?.confidence);
  const validConfidence = Number.isFinite(confidence)
    ? Math.max(0, Math.min(100, confidence * 100))
    : null;

  return (
    <main className="app-shell">
      <nav className="topbar">
        <div className="brand">
          <span className="brand-mark">T</span>
          <span>
            TrustChain <b>AI</b>
          </span>
        </div>

        <span className="status">
          <span className="status-dot" />
          DEMO ENVIRONMENT
        </span>
      </nav>

      <section className="hero">
        <p className="eyebrow">EVIDENCE-BASED DECISION SUPPORT</p>

        <h1>
          Trust decisions.
          <br />
          <span>Made transparent.</span>
        </h1>

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
            maxLength={100000}
            disabled={loading}
          />

          <label htmlFor="missing">Missing information</label>
          <textarea
            id="missing"
            value={missingInfo}
            onChange={(event) => setMissingInfo(event.target.value)}
            placeholder="Enter one item per line"
            rows={3}
            maxLength={100000}
            disabled={loading}
          />

          <label htmlFor="conflicts">Conflicting evidence</label>
          <textarea
            id="conflicts"
            value={conflicts}
            onChange={(event) => setConflicts(event.target.value)}
            placeholder="Example: Address details do not match"
            rows={3}
            maxLength={100000}
            disabled={loading}
          />

          <p className="field-hint">
            Enter each item on a separate line. Maximum 50 items per
            field, with up to 2,000 characters per item.
          </p>

          <button
            className="audit-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Analyzing evidence..." : "Run evidence audit →"}
          </button>

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
        </form>

        <section className="panel result-panel" aria-live="polite">
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

          {loading && (
            <p className="field-hint" role="status">
              Waiting for the backend...
            </p>
          )}

          {result && (
            <div className="result-content">
              <p className="result-label">DECISION</p>

              <h3
                className={`decision decision-${String(
                  result.decision
                ).toLowerCase()}`}
              >
                {result.decision}
              </h3>

              <p className="field-hint">
                This is a rule-based demonstration result. Human review
                is required.
              </p>

              <p className="result-label">REPORTED CONFIDENCE</p>

              <div className="confidence-row">
                <strong>
                  {validConfidence === null
                    ? "N/A"
                    : `${Math.round(validConfidence)}%`}
                </strong>

                <span>Illustrative score only</span>
              </div>

              <div
                className="confidence-track"
                role="progressbar"
                aria-label="Illustrative confidence score"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={validConfidence ?? 0}
              >
                <div
                  className="confidence-fill"
                  style={{
                    width: `${validConfidence ?? 0}%`,
                  }}
                />
              </div>

              <p className="field-hint">
                This score is not a validated probability of correctness.
              </p>

              <div className="detail-block">
                <h4>Reason</h4>
                <p>{result.reason || "No explanation provided."}</p>
              </div>

              <div className="detail-block">
                <h4>Evidence used</h4>
                {renderList(result.evidence_used, "No evidence listed.")}
              </div>

              <div className="detail-block">
                <h4>Missing information</h4>
                {renderList(
                  result.missing_information,
                  "None reported."
                )}
              </div>

              <div className="detail-block">
                <h4>Conflicting evidence</h4>
                {renderList(
                  result.conflicting_evidence,
                  "None reported."
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

      <footer>TRUSTCHAIN AI · TRANSPARENT BY DESIGN</footer>
    </main>
  );
}

export default App;
