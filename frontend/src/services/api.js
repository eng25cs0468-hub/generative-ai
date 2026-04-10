import axios from "axios";

const API = "http://127.0.0.1:8000";

export const uploadFile = (formData) =>
  axios.post(`${API}/upload`, formData);

export const generateChart = (query, chartType = "auto") =>
  axios.post(`${API}/generate-chart`, { query, chartType });

export const getSalesCount = () =>
  axios.get(`${API}/sales-count`);

export const getHistory = (limit = 20) =>
  axios.get(`${API}/history`, { params: { limit } });

export const getInsights = (metric = "Amount") =>
  axios.get(`${API}/insights`, { params: { metric } });

export const getGenAIStatus = () =>
  axios.get(`${API}/genai-status`);

export const getAnalyticsSummary = () =>
  axios.get(`${API}/analytics-summary`);
