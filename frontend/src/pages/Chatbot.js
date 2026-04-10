import React, { useState } from "react";
import { generateChart } from "../services/api";
import Effects from "../components/Effects";

function Chatbot({ effectsEnabled = false }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [showEffect, setShowEffect] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) {
      return;
    }

    const query = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setInput("");
    setLoading(true);

    try {
      const response = await generateChart(query, "auto");
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: response.data?.message || "Chart generated.",
        },
      ]);
      if (effectsEnabled) {
        setShowEffect(true);
        setTimeout(() => setShowEffect(false), 3000);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: `Failed: ${err.response?.data?.error || err.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page chatbot-page">
      <div className="page-content">
        {showEffect && <Effects />}
        <h1 className="page-title">🤖 Chatbot</h1>
        <p className="page-subtitle">Chat-style query input for quick generation</p>

        <div className="chat-panel">
          {messages.length === 0 && <p className="chat-empty">Start chatting with your data.</p>}
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-bubble ${msg.role === "user" ? "chat-user" : "chat-bot"}`}>
              {msg.text}
            </div>
          ))}
        </div>

        <div className="query-controls">
          <input
            type="text"
            className="query-input"
            placeholder="Ask: show sales trend over time"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button className="btn btn-generate" onClick={handleSend} disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
