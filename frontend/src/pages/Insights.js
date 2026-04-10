import React from "react";
import { useEffect, useState } from "react";
import { getInsights } from "../services/api";

function Insights() {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await getInsights("Amount");
        setInsight(response.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const insights = insight
    ? [
        {
          title: "Highest Category",
          value: insight.highest?.label || "-",
          icon: "📈",
          detail: `${insight.highest?.value ?? 0}`,
        },
        {
          title: "Lowest Category",
          value: insight.lowest?.label || "-",
          icon: "📉",
          detail: `${insight.lowest?.value ?? 0}`,
        },
        {
          title: "Total",
          value: `${insight.total ?? 0}`,
          icon: "🧮",
          detail: `Metric: ${insight.metric || "Amount"}`,
        },
      ]
    : [];

  return (
    <div className="page insights-page">
      <div className="page-content">
        <h1 className="page-title">💡 Insights & Analysis</h1>
        <p className="page-subtitle">Key metrics from your data</p>

        {loading && <p>Loading insights...</p>}
        {error && <p className="error-message">❌ {error}</p>}

        <div className="insights-grid">
          {insights.map((insight, index) => (
            <div key={index} className="insight-card">
              <div className="insight-icon">{insight.icon}</div>
              <h3 className="insight-title">{insight.title}</h3>
              <p className="insight-value">{insight.value}</p>
              <p className="insight-detail">{insight.detail}</p>
            </div>
          ))}
        </div>

        <div className="analysis-section">
          <h2>📊 Analysis</h2>
          <ul className="analysis-list">
            <li>Highest value: {insight?.highest?.label || "-"} ({insight?.highest?.value ?? 0})</li>
            <li>Lowest value: {insight?.lowest?.label || "-"} ({insight?.lowest?.value ?? 0})</li>
            <li>Total {insight?.metric || "Amount"}: {insight?.total ?? 0}</li>
          </ul>
        </div>

        <div className="info-box">
          <h3>🎯 Note</h3>
          <p>These insights will be computed dynamically from uploaded data.</p>
        </div>
      </div>
    </div>
  );
}

export default Insights;
