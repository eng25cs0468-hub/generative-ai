import React, { useEffect, useState } from "react";


export default function WebSocketDemo() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [ws, setWs] = useState(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const socket = new window.WebSocket("ws://127.0.0.1:8000/ws");
    socket.onopen = () => setMessages((msgs) => [...msgs, "WebSocket connected"]);
    socket.onmessage = (event) => setMessages((msgs) => [...msgs, event.data]);
    socket.onclose = () => setMessages((msgs) => [...msgs, "WebSocket closed"]);
    setWs(socket);
    return () => socket.close();
  }, []);


  const sendMessage = () => {
    if (ws && input) {
      ws.send(input);
      setInput("");
    }
  };

  const sendEmail = () => {
    if (ws && email) {
      const msg = JSON.stringify({ action: "send_email", email });
      ws.send(msg);
      setEmail("");
    }
  };

  return (
    <div className="websocket-demo" style={{
      maxWidth: 420,
      margin: '32px auto',
      background: '#181f2a',
      borderRadius: 12,
      boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
      padding: 24
    }}>
      <h3 style={{ color: '#60a5fa', marginBottom: 16 }}>Real-Time Updates (WebSocket Demo)</h3>
      <div style={{
        minHeight: 120,
        maxHeight: 220,
        background: '#232b3b',
        color: '#fff',
        padding: 12,
        borderRadius: 8,
        overflowY: 'auto',
        marginBottom: 12,
        fontSize: '1.08rem',
        boxShadow: '0 1px 6px rgba(0,0,0,0.08)'
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            background: msg.toLowerCase().includes('connected') ? 'rgba(34,197,94,0.13)' : msg.toLowerCase().includes('closed') ? 'rgba(248,113,113,0.13)' : 'rgba(96,165,250,0.13)',
            color: msg.toLowerCase().includes('connected') ? '#22c55e' : msg.toLowerCase().includes('closed') ? '#f87171' : '#60a5fa',
            borderRadius: 7,
            padding: '7px 12px',
            margin: '6px 0',
            fontWeight: 500,
            wordBreak: 'break-word',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}>{msg}</div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: 10, borderRadius: 7, border: '1px solid #334155', background: '#1e293b', color: '#fff', fontSize: '1rem' }}
        />
        <button onClick={sendMessage} style={{
          background: 'linear-gradient(90deg, #2563eb, #60a5fa)',
          color: '#fff',
          border: 'none',
          borderRadius: 7,
          padding: '0 18px',
          fontWeight: 600,
          fontSize: '1rem',
          cursor: 'pointer',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
        }}>
          Send
        </button>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email to receive a report"
          style={{ flex: 1, padding: 10, borderRadius: 7, border: '1px solid #334155', background: '#1e293b', color: '#fff', fontSize: '1rem' }}
        />
        <button onClick={sendEmail} style={{
          background: 'linear-gradient(90deg, #22c55e, #60a5fa)',
          color: '#fff',
          border: 'none',
          borderRadius: 7,
          padding: '0 18px',
          fontWeight: 600,
          fontSize: '1rem',
          cursor: 'pointer',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
        }}>
          Send Email
        </button>
      </div>
    </div>
  );
}
