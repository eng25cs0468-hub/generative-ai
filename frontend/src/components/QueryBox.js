import React, { useRef, useState } from "react";

function QueryBox({ onGenerate, loading }) {
  const [query, setQuery] = useState("");
  // Chart type selection removed; always use 'auto'
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const handleGenerate = () => {
    if (!query.trim()) {
      alert("Please enter a query.");
      return;
    }
    onGenerate(query, "auto");
    setQuery("");
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      if (transcript.trim()) {
        setQuery(transcript.trim());
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="query-box">
      <h2 className="section-title">🔍 Ask a Question</h2>
      <input
        type="text"
        placeholder="e.g., show sales by state, profit by category..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleGenerate()}
        className="query-input"
      />
      <div className="query-controls">
        <button
          onClick={handleVoiceInput}
          type="button"
          className="btn btn-voice"
        >
          {listening ? "🎙 Listening..." : "🎤 Voice"}
        </button>
      </div>
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="btn btn-generate"
      >
        {loading ? "Generating..." : "Generate Chart"}
      </button>
    </div>
  );
}

export default QueryBox;
