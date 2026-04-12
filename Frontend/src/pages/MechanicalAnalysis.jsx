import React, { useEffect, useState } from "react";
import API from "../api/api";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const MechanicalAnalysis = () => {
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [columns, setColumns] = useState([]);
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
      console.error("Dataset load error:", err);
    }
  };

  /* =========================
     DATASET SELECT
  ========================= */
  const handleDatasetChange = (datasetId) => {
    setSelectedDataset(datasetId);
    setAnalysisResult(null);

    const ds = datasets.find((d) => d._id === datasetId);

    if (!ds || !ds.columns) return;

    const cols = ds.columns;

    setColumns(cols);

    const targets = cols.filter((col) =>
      ["UTS", "YS", "ELOG", "Hardness", "RA"].includes(col),
    );

    const inputs = cols.filter(
      (col) => !targets.includes(col) && col !== cols[0],
    );

    setInputColumns(inputs);
    setTargetColumns(targets);

    setSelectedInputs(inputs);
    setSelectedTargets(targets);
  };

  /* =========================
     TOGGLE FUNCTIONS
  ========================= */
  const toggleInput = (col) => {
    setSelectedInputs((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col],
    );
  };

  const toggleTarget = (col) => {
    setSelectedTargets((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col],
    );
  };

  /* =========================
     RUN ANALYSIS
  ========================= */
  const runAnalysis = async () => {
    if (!selectedDataset) {
      alert("Please select dataset");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/mechanical/run", {
        datasetId: selectedDataset,
        inputColumns: selectedInputs,
        targetColumns: selectedTargets,
      });

      setAnalysisResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Mechanical analysis failed");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     SEVERITY DISTRIBUTION
  ========================= */
  const severityCounts = {
    "Very Low": 0,
    Low: 0,
    High: 0,
    "Very High": 0,
  };

  if (analysisResult?.results) {
    analysisResult.results.forEach((item) => {
      if (severityCounts[item.severity] !== undefined) {
        severityCounts[item.severity]++;
      }
    });
  }

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

  /* =========================
     PROPERTY DISTRIBUTION (DYNAMIC)
  ========================= */
  const propertyCount = {};

  if (analysisResult?.results) {
    analysisResult.results.forEach((r) => {
      if (!propertyCount[r.property]) {
        propertyCount[r.property] = 0;
      }
      propertyCount[r.property]++;
    });
  }

const colors = [
  "#0ea5e9", // blue
  "#6366f1", // indigo
  "#22c55e", // green
  "#f59e0b", // orange
  "#ef4444", // red
  "#14b8a6", // teal (extra safety)
];

const propertyChart = {
  labels: Object.keys(propertyCount),
  datasets: [
    {
      label: "Mechanical Property Distribution",
      data: Object.values(propertyCount),

      backgroundColor: Object.keys(propertyCount).map(
        (_, i) => colors[i % colors.length]
      ),
    },
  ],
};

  /* =========================
     TOP PARAMETERS
  ========================= */
  let topParameters = [];

  if (analysisResult?.results) {
    const paramMap = {};

    analysisResult.results.forEach((item) => {
      if (!paramMap[item.parameter]) {
        paramMap[item.parameter] = item.posterior_probability;
      } else {
        if (item.posterior_probability > paramMap[item.parameter]) {
          paramMap[item.parameter] = item.posterior_probability;
        }
      }
    });

    topParameters = Object.keys(paramMap)
      .map((p) => ({
        parameter: p,
        posterior_probability: paramMap[p],
      }))
      .sort((a, b) => b.posterior_probability - a.posterior_probability)
      .slice(0, 10);
  }

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

const topParamChart = {
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

  /* =========================
     HEATMAP
  ========================= */
  const heatmapData = {};

  if (analysisResult?.results) {
    analysisResult.results.forEach((row) => {
      if (!heatmapData[row.parameter]) {
        heatmapData[row.parameter] = {};
      }
      heatmapData[row.parameter][row.property] = row.severity;
    });
  }

  const properties = analysisResult?.results
    ? [...new Set(analysisResult.results.map((r) => r.property))]
    : [];

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

  /* =========================
     RECOMMENDATIONS
  ========================= */
  let recommendations = [];

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
        (a, b) => a.posterior_probability - b.posterior_probability,
      )[0];

      recommendations.push({
        parameter: param,
        optimalRange: best.range,
      });
    });
  }

  /* =========================
     PDF
  ========================= */
  const downloadReport = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Mechanical Property Analysis Report", 20, 20);

    let y = 40;

    recommendations.forEach((r) => {
      doc.text(`${r.parameter} : ${r.optimalRange}`, 20, y);
      y += 7;
    });

    doc.save("Mechanical_Report.pdf");
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
    },
  };

  return (
    <main className="dashboard-container">
      <div className="page-header">
        <h1 className="page-title">
          <i className="fas fa-cogs"></i> Mechanical Property Analytics
        </h1>

        <p className="page-subtitle">
          Analyze selected parameters and properties dynamically
        </p>
      </div>

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
          {loading ? "Running Analysis..." : "Run Mechanical Analysis"}
        </button>
      </div>

      {/* INPUT + TARGET (2 COLUMN UI) */}
      {columns.length > 0 && (
        <div className="card mt-3">
          <div className="row">
            <div className="col">
              <h3>Select Input Parameters</h3>

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

            <div className="col">
              <h3>Select Target Properties</h3>

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
        </div>
      )}

      {analysisResult?.results?.length > 0 && (
        <div className="row mt-3">
          {" "}
          <div className="col">
            {" "}
            <div className="card">
              {" "}
              <h3>Severity Distribution</h3>{" "}
              <div style={{ height: "350px" }}>
                {" "}
                <Bar data={severityChartData} />{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          <div className="col">
            {" "}
            <div className="card">
              {" "}
              <h3>Mechanical Property Distribution</h3>{" "}
              <div style={{ height: "350px" }}>
                {" "}
                <Bar data={propertyChart} />{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}

      {analysisResult?.results?.length > 0 && (
        <div className="card mt-3">
          <h3>Top Influencing Parameters</h3>

          <div style={{ height: "400px" }}>
            <Bar data={topParamChart} options={chartOptions} />
          </div>
        </div>
      )}

      {analysisResult?.results?.length > 0 && (
        <div className="card mt-3">
          <h3>Parameter vs Mechanical Property Heatmap</h3>

          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Parameter</th>

                  {properties.map((p) => (
                    <th key={p}>{p}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {Object.keys(heatmapData).map((param) => (
                  <tr key={param}>
                    <td>{param}</td>

                    {properties.map((prop) => {
                      const sev = heatmapData[param]?.[prop];

                      return (
                        <td
                          key={prop}
                          style={{
                            background: severityColor(sev),
                            color: "white",
                            textAlign: "center",
                          }}
                        >
                          {sev || "-"}
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

      {recommendations.length > 0 && (
        <div className="card mt-3">
          <h3>Recommended Parameter Ranges</h3>

          <table>
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
      )}

      {analysisResult && (
        <div className="form-actions">
          <button onClick={downloadReport} className="btn-primary">
            Download Report
          </button>

          <Link to="/dashboard" className="btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      )}
    </main>
  );
};

export default MechanicalAnalysis;
