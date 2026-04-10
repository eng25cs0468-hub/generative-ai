import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Sidebar() {
  const pages = [
    { id: "dashboard", label: "Dashboard" },
    { id: "history", label: "History" },
    { id: "insights", label: "Insights" },
    { id: "analytics", label: "Analytics" },
    { id: "settings", label: "Settings" },
  ];
  const navigate = useNavigate();
  const location = useLocation();
  const activePage = location.pathname.split("/")[2] || "dashboard";

  return (
    <aside className="sidebar">
      <h2 className="section-title">GenAI Dashboard</h2>
      <nav className="sidebar-nav">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => navigate(`/${page.id}`)}
            className={`nav-link ${activePage === page.id ? "active" : ""}`}
          >
            {page.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
