import React from "react";

function Settings({ theme, setTheme, effectsEnabled, setEffectsEnabled }) {
  return (
    <div className="page settings-page">
      <div className="page-content">
        <h1 className="page-title">⚙️ Settings</h1>
        <p className="page-subtitle">Customize theme and animations</p>

        <div className="analysis-section">
          <h2>Theme</h2>
          <div className="settings-row">
            <button
              className={`btn ${theme === "dark" ? "btn-generate" : "btn-effects"}`}
              onClick={() => setTheme("dark")}
            >
              Dark
            </button>
            <button
              className={`btn ${theme === "light" ? "btn-generate" : "btn-effects"}`}
              onClick={() => setTheme("light")}
            >
              Light
            </button>
          </div>
        </div>

        <div className="analysis-section">
          <h2>Animations</h2>
          <div className="settings-row">
            <button className="btn btn-effects" onClick={() => setEffectsEnabled(!effectsEnabled)}>
              {effectsEnabled ? "Turn OFF Animations" : "Turn ON Animations"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
