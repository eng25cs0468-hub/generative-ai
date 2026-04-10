
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Insights from './pages/Insights';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import AuthForm from './components/AuthForm';

import Snow from './components/Snow';
import './App.css';


function AppRouter() {
	const [effectsEnabled, setEffectsEnabled] = React.useState(true);
	const [theme, setTheme] = React.useState('dark');
	const [token, setToken] = React.useState(null);
	const [username, setUsername] = React.useState("");

	// Custom onAuth to set token and username
	const handleAuth = (accessToken, user) => {
		setToken(accessToken);
		setUsername(user);
	};

	if (!token) {
		return (
			<div className={`app-container theme-${theme}`}>
				<div className="app-main">
					<AuthForm onAuth={handleAuth} />
				</div>
			</div>
		);
	}

	return (
		<Router>
			<div className={`app-container theme-${theme}`}>
				<Snow />
				<Sidebar />
				<div className="app-main">
					<Navbar
						title="GenAI Dashboard"
						effectsEnabled={effectsEnabled}
						setEffectsEnabled={setEffectsEnabled}
					/>
					<div style={{margin: '24px 0 0 0', fontSize: '1.3rem', fontWeight: 600, color: '#60a5fa', textAlign: 'center'}}>
						{username && `Welcome, ${username}!`}
					</div>
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
