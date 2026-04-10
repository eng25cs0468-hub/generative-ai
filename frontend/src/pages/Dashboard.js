import React, { useState } from "react";
import UploadBox from "../components/UploadBox";
import QueryBox from "../components/QueryBox";
import ChartCard from "../components/ChartCard";
import Effects from "../components/Effects";
import { generateChart } from "../services/api";

function Dashboard({ effectsEnabled = false }) {
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [showGenerateEffect, setShowGenerateEffect] = useState(false);

  const handleGenerateChart = async (query, chartType = "auto") => {
    setLoading(true);
    setError("");
    setChatLog((prev) => [...prev, { role: "user", text: `${query} (${chartType})` }]);

    try {
      const response = await generateChart(query, chartType);
      setCharts((prev) => [...prev, response.data]);
      setChatLog((prev) => [
        ...prev,
        {
          role: "bot",
          text: response.data.message || "Bot: Chart generated successfully.",
        },
      ]);
      if (effectsEnabled) {
        setShowGenerateEffect(true);
        setTimeout(() => setShowGenerateEffect(false), 3000);
      }
    } catch (err) {
      setError(`❌ Failed to generate chart: ${err.response?.data?.error || err.message}`);
      setChatLog((prev) => [
        ...prev,
        {
          role: "bot",
          text: `Bot: Failed to generate chart: ${err.response?.data?.error || err.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page dashboard-page">
      <div className="page-content">
        {showGenerateEffect && <Effects />}
        <UploadBox />
        <QueryBox onGenerate={handleGenerateChart} loading={loading} />

        <div className="chat-panel">
          <h2 className="section-title">💬 Assistant</h2>
          {chatLog.length === 0 && (
            <p className="chat-empty">Ask a query to start the conversation.</p>
          )}
          {chatLog.map((item, index) => (
            <div
              key={index}
              className={`chat-bubble ${item.role === "user" ? "chat-user" : "chat-bot"}`}
            >
              {item.text}
            </div>
          ))}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="charts-grid">
          {charts.length === 0 && (
            <div className="empty-state">
              No charts yet. Upload data and enter a query to get started!
            </div>
          )}
          {charts.map((chart, index) => (
            <ChartCard key={index} chart={chart} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
