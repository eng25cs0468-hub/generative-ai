import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

function ChartCard({ chart, index }) {
  if (!chart || !chart.chartData || chart.chartData.length === 0) {
    return null;
  }

  return (
    <div className="chart-card">
      <h3 className="chart-title">
        {(chart.chartType || "unknown").toUpperCase()} Chart
      </h3>
      <p className="chart-info">
        Grouped by: <strong>{chart.groupBy}</strong> | Metric: <strong>{chart.metric}</strong>
      </p>

      {/* AI Explanation Section */}
      {chart.explanation && (
        <div className="bg-gray-800 p-4 mt-4 rounded">
          <h3>🧠 AI Explanation</h3>
          <p>{chart.explanation}</p>
        </div>
      )}

      <ResponsiveContainer width="100%" height={300}>
        {chart.chartType === "bar" && (
          <BarChart data={chart.chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        )}

        {chart.chartType === "line" && (
          <LineChart data={chart.chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        )}

        {chart.chartType === "pie" && (
          <PieChart>
            <Pie
              data={chart.chartData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {chart.chartData.map((entry, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        )}

        {chart.chartType === "scatter" && (
          <ScatterChart>
            <XAxis type="number" dataKey="x" name="Index" />
            <YAxis type="number" dataKey="y" name={chart.metric || "Value"} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={chart.chartData} fill="#f59e0b" />
          </ScatterChart>
        )}

        {chart.chartType === "histogram" && (
          <BarChart data={chart.chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8b5cf6" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export default ChartCard;
