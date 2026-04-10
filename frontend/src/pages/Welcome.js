import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <h1>Welcome to GenAI Dashboard</h1>
      <p>Your all-in-one analytics and charting platform.</p>
      <div className="welcome-actions">
        <button onClick={() => navigate('/login')}>Login</button>
        <button onClick={() => navigate('/register')}>Register</button>
      </div>
    </div>
  );
};

export default Welcome;
