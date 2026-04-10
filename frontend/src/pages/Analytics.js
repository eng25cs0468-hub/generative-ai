import React, { useEffect, useState } from "react";
import { getAnalyticsSummary } from "../services/api";

function Analytics() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await getAnalyticsSummary();
        setSummary(response.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div className="page analytics-page">
      <div className="page-content">
        <h1 className="page-title">📊 Analytics</h1>
        <p className="page-subtitle">Dataset health and numeric summary</p>

        {loading && <p>Loading analytics...</p>}
        {error && <p className="error-message">❌ {error}</p>}

        {!loading && !error && summary && (
          <>
            {!summary.connected && (
              <p className="error-message">⚠ {summary.message || "Analytics unavailable."}</p>
            )}

            {summary.connected && summary.totalRows === 0 && (
              <p className="error-message">⚠ {summary.message || "No data uploaded yet."}</p>
            )}

            <div className="insights-grid">
              <div className="insight-card">
                <div className="insight-icon">🧾</div>
                <h3 className="insight-title">Total Rows</h3>
                <p className="insight-value">{summary.totalRows ?? 0}</p>
              </div>
              <div className="insight-card">
                <div className="insight-icon">🧱</div>
                <h3 className="insight-title">Columns</h3>
                <p className="insight-value">{summary.columns?.length ?? 0}</p>
              </div>
            </div>

            <div className="analysis-section">
              <h2>Columns</h2>
              <p>{(summary.columns || []).join(", ") || "No columns found."}</p>
            </div>

            <div className="analysis-section">
              <h2>Numeric Summary</h2>
              {Object.keys(summary.numericSummary || {}).length === 0 ? (
                <p>No numeric summary available.</p>
              ) : (
                <ul className="analysis-list">
                  {Object.entries(summary.numericSummary).map(([metric, stats]) => (
                    <li key={metric}>
                      <strong>{metric}</strong>: min {stats.min}, max {stats.max}, avg {stats.avg}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="analysis-section">
              <h2>Sample Rows</h2>
              {Array.isArray(summary.sample) && summary.sample.length > 0 ? (
                <ul className="analysis-list">
                  {summary.sample.map((row, idx) => (
                    <li key={idx}>{JSON.stringify(row)}</li>
                  ))}
                </ul>
              ) : (
                <p>No sample rows available.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Analytics;
