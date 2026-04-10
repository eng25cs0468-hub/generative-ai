import React, { useRef, useState } from "react";



import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  ScatterChart,
  Scatter
} from 'recharts';

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // yellow
  '#ef4444', // red
  '#8b5cf6', // purple
  '#f472b6', // pink
  '#f97316', // orange
  '#22d3ee', // cyan
  '#a3e635', // lime
  '#eab308', // amber
];
function ChartCard({ chart, index }) {
  const chartRef = useRef();
  const [showTable, setShowTable] = useState(false);

  if (!chart || !chart.chartData || chart.chartData.length === 0) {
    return null;
  }

  // Download chart as image
  const handleDownload = () => {
    const svg = chartRef.current.querySelector('svg');
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const canvas = document.createElement('canvas');
    const img = new window.Image();
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `${chart.chartType || 'chart'}-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    img.src = url;
  };

  // Export data as CSV
  const handleExportCSV = () => {
    const rows = [Object.keys(chart.chartData[0])].concat(chart.chartData.map(obj => Object.values(obj)));
    const csvContent = rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chart.chartType || 'chart'}-${index + 1}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };



  return (
    <div className="chart-card">
      <h3 className="chart-title">
        {(chart.chartType || "unknown").toUpperCase()} Chart
      </h3>
      <p className="chart-info">
        Grouped by: <strong>{chart.groupBy}</strong> | Metric: <strong>{chart.metric}</strong>
      </p>

      {/* System Prompt Explanation */}
      <div className="system-explanation" style={{ background: '#23272f', color: '#f3f4f6', padding: '10px', borderRadius: 6, marginBottom: 8 }}>
        <strong>System:</strong> This chart visualizes your uploaded data using the selected chart type, group, and metric. Use the buttons below to download, export, or view the data table. For deeper insights, see the AI explanation below.
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: 8 }}>
        <button onClick={handleDownload}>Download Image</button>
        <button onClick={handleExportCSV}>Export CSV</button>
        <button onClick={() => setShowTable((v) => !v)}>{showTable ? 'Hide' : 'Show'} Data Table</button>
      </div>

      {/* Data Table View */}
      {showTable && (
        <div style={{ marginTop: 16, overflowX: 'auto' }}>
          <table border="1" cellPadding="6" style={{ width: '100%', background: '#222', color: '#fff' }}>
            <thead>
              <tr>
                {Object.keys(chart.chartData[0]).map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chart.chartData.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((val, j) => (
                    <td key={j}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AI Explanation Section */}
      {chart.explanation && (
        <div className="bg-gray-800 p-4 mt-4 rounded">
          <h3>🧠 AI Explanation</h3>
          <p>{chart.explanation}</p>
        </div>
      )}

      <div ref={chartRef} style={{ width: '100%', height: 300 }}>
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
    </div>
  );
}

export default ChartCard;
