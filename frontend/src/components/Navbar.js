import React from "react";

function Navbar({ title = "GenAI Dashboard", effectsEnabled = false, setEffectsEnabled = () => {} }) {
  const handleToggleEffects = () => {
    setEffectsEnabled(!effectsEnabled);
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <h1 className="navbar-title">{title}</h1>
        <button
          onClick={handleToggleEffects}
          className="btn btn-effects"
        >
          {effectsEnabled ? "✨ Effects ON" : "✨ Effects OFF"}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
