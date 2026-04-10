import React, { useState, useEffect } from "react";
import ChartCard from "../components/ChartCard";
import { getHistory } from "../services/api";

function History() {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getHistory(25);
        const records = response.data?.history || [];
        setHistory(records);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const toChartCard = (item) => {
    const chartData = item.chartData || (Array.isArray(item.data)
      ? item.data.map((entry) => ({
          name: entry?.[item.x] ?? entry?.name ?? "Unknown",
          value: entry?.[item.y] ?? entry?.value ?? 0,
        }))
      : []);

    return {
      chartType: (item.chartType || "bar").toLowerCase(),
      chartData,
      groupBy: item.groupBy || item.x || "-",
      metric: item.metric || item.y || "-",
    };
  };

  return (
    <div className="page history-page">
      <div className="page-content">
        <h1 className="page-title">📜 Query History</h1>
        <p className="page-subtitle">Previous queries from MongoDB</p>

        <div className="history-list-container">
          {loading && <p>Loading history...</p>}
          {error && <p className="error-message">❌ {error}</p>}
          {history.length === 0 ? (
            <p className="empty-state">No history yet.</p>
          ) : (
            <div className="history-grid">
              {history.map((item, index) => (
                <div key={index} className="history-item-full">
                  <div className="history-meta">
                    <strong>{index + 1}. {item.query || "Unknown query"}</strong>
                    <div>
                      chart: {item.chartType || "-"} | x: {item.x || item.groupBy || "-"} | y: {item.y || item.metric || "-"}
                    </div>
                    <div>
                      source: {item.source || "-"}
                    </div>
                    {item.createdAt && <div>saved: {new Date(item.createdAt).toLocaleString()}</div>}
                  </div>
                  <ChartCard chart={toChartCard(item)} index={index} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="info-box">
          <h3>💡 Info</h3>
          <p>History is stored in MongoDB and will be fetched when backend is connected.</p>
          <p>If you want, I can next make the history page more polished by adding timestamps, chart type badges, and a compact card layout.</p>
        </div>
      </div>
    </div>
  );
}

export default History;
