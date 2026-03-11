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

  const runAnalysis = async () => {
    if (!selectedDataset) {
      alert("Please select dataset");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/analysis/run", {
        datasetId: selectedDataset,
      });

      setAnalysisResult(res.data.result);
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

  /* Severity Distribution */

  const severityCounts = {
    "Very Low": 0,
    Low: 0,
    High: 0,
    "Very High": 0,
  };

  if (analysisResult?.diagnosis_results) {
    analysisResult.diagnosis_results.forEach((item) => {
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

  /* Top Critical Parameters */

  let topParameters = [];

  if (analysisResult?.diagnosis_results) {
    topParameters = [...analysisResult.diagnosis_results]
      .sort((a, b) => b.posterior_probability - a.posterior_probability)
      .slice(0, 10);
  }

  const criticalChartData = {
    labels: topParameters.map((p) => p.parameter),
    datasets: [
      {
        label: "Posterior Probability",
        data: topParameters.map((p) => p.posterior_probability),
        backgroundColor: "#2845D6",
      },
    ],
  };

  /* Heatmap */

  const heatmapData = {};

  if (analysisResult?.diagnosis_results) {
    analysisResult.diagnosis_results.forEach((row) => {
      if (!heatmapData[row.parameter]) {
        heatmapData[row.parameter] = {};
      }

      heatmapData[row.parameter][row.defect] = row.severity;
    });
  }

  const defectTypes = analysisResult?.diagnosis_results
    ? [...new Set(analysisResult.diagnosis_results.map((r) => r.defect))]
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

  /* Range Recommendation */

  let recommendations = [];

  if (analysisResult?.diagnosis_results) {
    const grouped = {};

    analysisResult.diagnosis_results.forEach((row) => {
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

  /* PROFESSIONAL PDF */

  const downloadReport = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Diagnosis Analytics Report", 20, 20);

    doc.setFontSize(12);

    doc.text("Dataset Summary", 20, 35);

    doc.text(`Rows: ${analysisResult.dataset_summary.rows}`, 20, 45);
    doc.text(
      `Parameters: ${analysisResult.dataset_summary.input_parameters}`,
      20,
      52,
    );
    doc.text(`Defects: ${analysisResult.dataset_summary.defect_types}`, 20, 59);

    doc.text("Recommended Parameter Ranges", 20, 75);

    let y = 85;

    recommendations.forEach((rec) => {
      doc.text(`${rec.parameter}`, 20, y);
      doc.text(`${rec.optimalRange}`, 120, y);

      y += 7;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
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
          onChange={(e) => setSelectedDataset(e.target.value)}
        >
          <option value="">Choose dataset</option>

          {datasets.map((ds) => (
            <option key={ds._id} value={ds._id}>
              {ds.fileName}
            </option>
          ))}
        </select>

        <button
          onClick={runAnalysis}
          className="btn-primary"
          style={{ marginTop: "10px" }}
        >
          {loading ? "Running Analysis..." : "Run Data Analysis"}
        </button>
      </div>

      {/* SUMMARY */}

      {analysisResult?.dataset_summary && (
        <div className="card mt-3">
          <h3>Dataset Summary</h3>

          <div className="row">
            <div className="col">
              <strong>Total Rows</strong>
              <p>{analysisResult.dataset_summary.rows}</p>
            </div>

            <div className="col">
              <strong>Input Parameters</strong>
              <p>{analysisResult.dataset_summary.input_parameters}</p>
            </div>

            <div className="col">
              <strong>Defect Types</strong>
              <p>{analysisResult.dataset_summary.defect_types}</p>
            </div>
          </div>
        </div>
      )}

      {/* CHARTS */}

      {analysisResult?.diagnosis_results && (
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

      {analysisResult?.diagnosis_results && (
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
                      const severity = heatmapData[param][def];

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
