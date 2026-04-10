
import React, { useState } from "react";


export default function AuthForm({ onAuth }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    // Simulate successful login for any username/password
    onAuth("dummy_token", username);
    setMessage("Login successful! (frontend only)");
  };

  return (
    <div className="auth-form">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-auth">
          Login
        </button>
      </form>
      {message && (
        <p className="auth-message" style={{
          marginTop: 18,
          color: message.toLowerCase().includes('success') ? '#22c55e' : '#f87171',
          fontWeight: 600,
          fontSize: '1.15rem',
          textAlign: 'center',
          background: message.toLowerCase().includes('success') ? 'rgba(34,197,94,0.08)' : 'rgba(248,113,113,0.08)',
          borderRadius: 8,
          padding: '10px 0',
          letterSpacing: 0.5
        }}>{message}</p>
      )}
    </div>
  );
}
