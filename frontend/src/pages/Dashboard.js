import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
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
  const [email, setEmail] = useState("");
  const wsRef = useRef(null);

  // Export all chart answers as PDF (with chart image, system, and AI explanation)
  const handleExportPDF = async () => {
    const doc = new jsPDF();
    let y = 10;
    for (let idx = 0; idx < charts.length; idx++) {
      const chart = charts[idx];
      doc.setFontSize(14);
      doc.text(`${(chart.chartType || "unknown").toUpperCase()} Chart`, 10, y);
      y += 8;
      doc.setFontSize(11);
      doc.text(`Grouped by: ${chart.groupBy} | Metric: ${chart.metric}`, 10, y);
      y += 8;

      // System explanation
      const systemText = "System: This chart visualizes your uploaded data using the selected chart type, group, and metric. Use the buttons below to download, export, or view the data table. For deeper insights, see the AI explanation below.";
      const systemLines = doc.splitTextToSize(systemText, 180);
      doc.text(systemLines, 10, y);
      y += systemLines.length * 7 + 4;

      // AI explanation
      if (chart.explanation) {
        doc.setFont(undefined, "bold");
        doc.text("🧠 AI Explanation", 10, y);
        doc.setFont(undefined, "normal");
        y += 7;
        const aiLines = doc.splitTextToSize(chart.explanation, 180);
        doc.text(aiLines, 10, y);
        y += aiLines.length * 7 + 4;
      }

      // Chart image
      const chartCard = document.querySelectorAll('.chart-card')[idx];
      if (chartCard) {
        const svg = chartCard.querySelector('svg');
        if (svg) {
          const serializer = new XMLSerializer();
          const svgString = serializer.serializeToString(svg);
          const canvas = document.createElement('canvas');
          const img = new window.Image();
          const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          await new Promise((resolve) => {
            img.onload = function () {
              canvas.width = img.width;
              canvas.height = img.height;
              canvas.getContext('2d').drawImage(img, 0, 0);
              URL.revokeObjectURL(url);
              const pngUrl = canvas.toDataURL('image/png');
              doc.addImage(pngUrl, 'PNG', 10, y, 180, 60);
              y += 65;
              resolve();
            };
            img.src = url;
          });
        }
      }

      y += 10;
      if (y > 220 && idx < charts.length - 1) {
        doc.addPage();
        y = 10;
      }
    }
    doc.save("dashboard-answers.pdf");
  };

  // Setup WebSocket connection once
  useEffect(() => {
    wsRef.current = new window.WebSocket("ws://127.0.0.1:8000/ws");
    return () => wsRef.current && wsRef.current.close();
  }, []);

  const sendEmail = () => {
    if (wsRef.current && email) {
      const msg = JSON.stringify({ action: "send_email", email });
      wsRef.current.send(msg);
      setEmail("");
    }
  };

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

        {/* PDF export button */}
        <div style={{ display: 'flex', gap: 8, margin: '18px 0', alignItems: 'center', maxWidth: 420 }}>
          <button onClick={handleExportPDF} style={{
            background: 'linear-gradient(90deg, #f59e0b, #60a5fa)',
            color: '#fff',
            border: 'none',
            borderRadius: 7,
            padding: '0 18px',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
          }}>
            Download PDF of All Answers
          </button>
        </div>


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
