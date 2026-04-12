import React, { useEffect, useState } from "react";
import API from "../api/api";
import { Link } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import jsPDF from "jspdf";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Diagnosis = () => {
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔥 NEW STATES
  const [, setColumns] = useState([]);
  const [inputColumns, setInputColumns] = useState([]);
  const [targetColumns, setTargetColumns] = useState([]);
  const [selectedInputs, setSelectedInputs] = useState([]);
  const [selectedTargets, setSelectedTargets] = useState([]);

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      const res = await API.get("/dataset");
      setDatasets(res.data);
    } catch (err) {
      console.error("Dataset load error", err);
    }
  };

  // 🔥 HANDLE DATASET CHANGE
  const handleDatasetChange = (datasetId) => {
    setSelectedDataset(datasetId);
    setAnalysisResult(null);

    const ds = datasets.find((d) => d._id === datasetId);
    if (!ds || !ds.columns) return;

    const cols = ds.columns;
    setColumns(cols);

    const targets = cols.slice(1, 6);
    const inputs = cols.slice(6);

    setInputColumns(inputs);
    setTargetColumns(targets);

    setSelectedInputs(inputs);
    setSelectedTargets(targets);
  };

  const toggleInput = (col) => {
    setSelectedInputs((prev) =>
      prev.includes(col)
        ? prev.filter((c) => c !== col)
        : [...prev, col]
    );
  };

  const toggleTarget = (col) => {
    setSelectedTargets((prev) =>
      prev.includes(col)
        ? prev.filter((c) => c !== col)
        : [...prev, col]
    );
  };

  const runAnalysis = async () => {
    if (!selectedDataset) {
      alert("Please select dataset");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/analysis/run", {
        datasetId: selectedDataset,
        inputColumns: selectedInputs,
        targetColumns: selectedTargets,
      });

      setAnalysisResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const horizontalChartOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
    },
  };

  const severityCounts =
    analysisResult?.dashboard?.severity_distribution || {
      "Very Low": 0,
      Low: 0,
      High: 0,
      "Very High": 0,
    };

  const severityChartData = {
    labels: Object.keys(severityCounts),
    datasets: [
      {
        label: "Severity Distribution",
        data: Object.values(severityCounts),
        backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"],
      },
    ],
  };

  const topParameters = analysisResult?.dashboard?.top_parameters || [];

const barColors = [
  "#0ea5e9",
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#14b8a6",
  "#a855f7",
  "#f97316",
  "#10b981",
  "#3b82f6",
];

const criticalChartData = {
  labels: topParameters.map((p) => p.parameter),
  datasets: [
    {
      label: "Posterior Probability",
      data: topParameters.map((p) => p.posterior_probability),

      backgroundColor: topParameters.map(
        (_, i) => barColors[i % barColors.length]
      ),
    },
  ],
};

  const heatmapData = analysisResult?.severityMatrix || {};

  const defectTypes = selectedTargets;

  const severityColor = (severity) => {
    switch (severity) {
      case "Very Low":
        return "#10b981";
      case "Low":
        return "#3b82f6";
      case "High":
        return "#f59e0b";
      case "Very High":
        return "#ef4444";
      default:
        return "#e5e7eb";
    }
  };

  const recommendations = [];

  if (analysisResult?.results) {
    const grouped = {};

    analysisResult.results.forEach((row) => {
      if (!grouped[row.parameter]) {
        grouped[row.parameter] = [];
      }
      grouped[row.parameter].push(row);
    });

    Object.keys(grouped).forEach((param) => {
      const best = grouped[param].sort(
        (a, b) => a.posterior_probability - b.posterior_probability
      )[0];

      recommendations.push({
        parameter: param,
        optimalRange: best.range,
      });
    });
  }

  const downloadReport = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Diagnosis Analytics Report", 20, 20);

    doc.setFontSize(12);

    doc.text(`Rows: ${analysisResult.summary.rows}`, 20, 40);

    let y = 60;

    recommendations.forEach((rec) => {
      doc.text(`${rec.parameter}`, 20, y);
      doc.text(`${rec.optimalRange}`, 120, y);
      y += 7;
    });

    doc.save("Diagnosis_Report.pdf");
  };

  return (
    <main className="dashboard-container">
      <div className="page-header">
        <h1 className="page-title">
          <i className="fas fa-chart-bar" /> Data Analytics
        </h1>

        <p className="page-subtitle">
          Identify critical parameters and defect severity ranges.
        </p>
      </div>

      {/* DATASET SELECT */}
      <div className="card">
        <h3>Select Dataset</h3>

        <select
          value={selectedDataset}
          onChange={(e) => handleDatasetChange(e.target.value)}
        >
          <option value="">Choose dataset</option>
          {datasets.map((ds) => (
            <option key={ds._id} value={ds._id}>
              {ds.fileName}
            </option>
          ))}
        </select>

        <button onClick={runAnalysis} className="btn-primary">
          {loading ? "Running..." : "Run Data Analysis"}
        </button>
      </div>

      {/* 🔥 INPUT SELECTION */}
      {inputColumns.length > 0 && (
        <div className="card mt-3">
          <h3>Select Input Parameters</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            {inputColumns.map((col) => (
              <label key={col}>
                <input
                  type="checkbox"
                  checked={selectedInputs.includes(col)}
                  onChange={() => toggleInput(col)}
                />
                {col}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 🔥 DEFECT SELECTION */}
      {targetColumns.length > 0 && (
        <div className="card mt-3">
          <h3>Select Defect Types</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            {targetColumns.map((col) => (
              <label key={col}>
                <input
                  type="checkbox"
                  checked={selectedTargets.includes(col)}
                  onChange={() => toggleTarget(col)}
                />
                {col}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* SUMMARY */}

      {analysisResult?.summary && (
        <div className="card mt-3">
          <h3>Dataset Summary</h3>

          <div className="row">
            <div className="col">
              <strong>Total Rows</strong>
              <p>{analysisResult.summary.rows}</p>
            </div>

            <div className="col">
              <strong>Input Parameters</strong>
              <p>{analysisResult.summary.input_parameters}</p>
            </div>

            <div className="col">
              <strong>Defect Types</strong>
              <p>{analysisResult.summary.defect_types}</p>
            </div>
          </div>
        </div>
      )}

      {/* CHARTS */}

      {analysisResult?.results && (
        <div className="row mt-3">
          <div className="col">
            <div className="card">
              <h3>Severity Distribution</h3>

              <div style={{ width: "100%", height: "350px" }}>
                <Bar data={severityChartData} />
              </div>
            </div>
          </div>

          <div className="col">
            <div className="card">
              <h3>Top Critical Parameters</h3>

              <div style={{ width: "100%", height: "350px" }}>
                <Bar
                  data={criticalChartData}
                  options={horizontalChartOptions}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEATMAP */}

      {analysisResult?.results && (
        <div className="card mt-3">
          <h3>Parameter vs Defect Heatmap</h3>

          <div style={{ overflowX: "auto" }}>
            <table style={{ minWidth: "800px" }}>
              <thead>
                <tr>
                  <th>Parameter</th>

                  {defectTypes.map((d) => (
                    <th key={d}>{d}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {Object.keys(heatmapData).map((param) => (
                  <tr key={param}>
                    <td>{param}</td>

                    {defectTypes.map((def) => {
                      const severity = heatmapData[param]?.[def];

                      return (
                        <td
                          key={def}
                          style={{
                            background: severityColor(severity),
                            color: "white",
                            textAlign: "center",
                          }}
                        >
                          {severity || "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECOMMENDATIONS */}

      {recommendations.length > 0 && (
        <div className="card mt-3">
          <h3>Recommended Parameter Ranges</h3>

          <div style={{ overflowX: "auto" }}>
            <table style={{ minWidth: "500px" }}>
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Optimal Range</th>
                </tr>
              </thead>

              <tbody>
                {recommendations.map((r, i) => (
                  <tr key={i}>
                    <td>{r.parameter}</td>
                    <td>{r.optimalRange}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ACTIONS */}

      {analysisResult && (
        <div className="form-actions">
          <button onClick={downloadReport} className="btn-primary">
            Download Diagnosis Report
          </button>

          <Link to="/dashboard" className="btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      )}
    </main>
  );
};

export default Diagnosis;