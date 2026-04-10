import { useState } from "react";
import AuthForm from "./components/AuthForm";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Insights from "./pages/Insights";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";


function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [effectsEnabled, setEffectsEnabled] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [token, setToken] = useState(null);

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard effectsEnabled={effectsEnabled} />;
      case "history":
        return <History />;
      case "insights":
        return <Insights />;
      case "analytics":
        return <Analytics />;
      case "settings":
        return (
          <Settings
            theme={theme}
            setTheme={setTheme}
            effectsEnabled={effectsEnabled}
            setEffectsEnabled={setEffectsEnabled}
          />
        );
      default:
        return <Dashboard effectsEnabled={effectsEnabled} />;
    }
  };

  if (!token) {
    return <AuthForm onAuth={setToken} />;
  }
  return (
    <div className={`app-container theme-${theme}`}>
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="app-main">
        <Navbar 
          title="GenAI Dashboard" 
          effectsEnabled={effectsEnabled}
          setEffectsEnabled={setEffectsEnabled}
        />
        {renderPage()}
      </div>
    </div>
  );
}

export default App;
