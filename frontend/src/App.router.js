import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Insights from './pages/Insights';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import './App.css';

function AppRouter() {
	const [effectsEnabled, setEffectsEnabled] = React.useState(true);
	const [theme, setTheme] = React.useState('dark');

	return (
		<Router>
			<div className={`app-container theme-${theme}`}>
				<Sidebar />
				<div className="app-main">
					<Navbar
						title="GenAI Dashboard"
						effectsEnabled={effectsEnabled}
						setEffectsEnabled={setEffectsEnabled}
					/>
					<Routes>
						<Route path="/" element={<Navigate to="/dashboard" replace />} />
						<Route path="/dashboard" element={<Dashboard effectsEnabled={effectsEnabled} />} />
						<Route path="/history" element={<History />} />
						<Route path="/insights" element={<Insights />} />
						<Route path="/analytics" element={<Analytics />} />
						<Route path="/settings" element={<Settings theme={theme} setTheme={setTheme} effectsEnabled={effectsEnabled} setEffectsEnabled={setEffectsEnabled} />} />
					</Routes>
				</div>
			</div>
		</Router>
	);
}

export default AppRouter;
