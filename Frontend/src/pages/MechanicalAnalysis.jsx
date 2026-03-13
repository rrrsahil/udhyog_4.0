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

  const runAnalysis = async () => {
    if (!selectedDataset) {
      alert("Please select dataset");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/mechanical/run", {
        datasetId: selectedDataset,
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
     TOP INFLUENCING PARAMETERS
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

    const paramArray = Object.keys(paramMap).map((param) => ({
      parameter: param,
      posterior_probability: paramMap[param],
    }));

    topParameters = paramArray
      .sort((a, b) => b.posterior_probability - a.posterior_probability)
      .slice(0, 10);
  }

  const topParamChart = {
    labels: topParameters.map((p) => p.parameter),

    datasets: [
      {
        label: "Posterior Probability",
        data: topParameters.map((p) => p.posterior_probability),
        backgroundColor: "#2845D6",
      },
    ],
  };

  const chartOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: { display: true },
    },

    scales: {
      x: {
        beginAtZero: true,
        title: { display: true, text: "Posterior Probability" },
      },
      y: {
        title: { display: true, text: "Process Parameters" },
      },
    },
  };

  /* =========================
     MECHANICAL PROPERTY DISTRIBUTION
  ========================= */

  const propertyCount = {
    UTS: 0,
    YS: 0,
    ELOG: 0,
    Hardness: 0,
    RA: 0,
  };

  if (analysisResult?.results) {
    analysisResult.results.forEach((r) => {
      if (propertyCount[r.property] !== undefined) {
        propertyCount[r.property]++;
      }
    });
  }

  const propertyChart = {
    labels: Object.keys(propertyCount),

    datasets: [
      {
        label: "Mechanical Property Distribution",
        data: Object.values(propertyCount),
        backgroundColor: [
          "#0ea5e9",
          "#6366f1",
          "#22c55e",
          "#f59e0b",
          "#ef4444",
        ],
      },
    ],
  };

  /* =========================
     HEATMAP DATA
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
     OPTIMAL RANGE
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
     PDF REPORT
  ========================= */

  const downloadReport = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Mechanical Property Analysis Report", 20, 20);

    doc.setFontSize(12);

    doc.text("Recommended Parameter Ranges", 20, 40);

    let y = 50;

    recommendations.forEach((r) => {
      doc.text(r.parameter, 20, y);
      doc.text(r.optimalRange, 120, y);

      y += 7;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save("Mechanical_Analysis_Report.pdf");
  };

  return (
    <main className="dashboard-container">
      <div className="page-header">
        <h1 className="page-title">
          <i className="fas fa-cogs"></i> Mechanical Property Analytics
        </h1>

        <p className="page-subtitle">
          Analyze parameters affecting UTS, YS, ELOG, Hardness and RA
        </p>
      </div>

      <div className="card">
        <h3>Select Dataset</h3>

        <select
          value={selectedDataset}
          onChange={(e) => setSelectedDataset(e.target.value)}
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

      {analysisResult?.results && (
        <div className="row mt-3">
          <div className="col">
            <div className="card">
              <h3>Severity Distribution</h3>

              <div style={{ height: "350px" }}>
                <Bar data={severityChartData} />
              </div>
            </div>
          </div>

          <div className="col">
            <div className="card">
              <h3>Mechanical Property Distribution</h3>

              <div style={{ height: "350px" }}>
                <Bar data={propertyChart} />
              </div>
            </div>
          </div>
        </div>
      )}

      {analysisResult?.results && (
        <div className="card mt-3">
          <h3>Top Influencing Parameters</h3>

          <div style={{ height: "400px" }}>
            <Bar data={topParamChart} options={chartOptions} />
          </div>
        </div>
      )}

      {analysisResult?.results && (
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
                      const sev = heatmapData[param][prop];

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
