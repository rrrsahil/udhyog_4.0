import React, { useEffect, useState } from "react";
import API from "../api/api";
import { Link, NavLink } from "react-router-dom";

const Dashboard = () => {
  const [datasetCount, setDatasetCount] = useState(0);
  const [modelCount, setModelCount] = useState(0);
  const [predictionCount, setPredictionCount] = useState(0);
  const [recentPredictions, setRecentPredictions] = useState([]);

  useEffect(() => {
    const loadStats = async () => {
      const d = await API.get("/dataset/count");
      const m = await API.get("/training/count");
      const p = await API.get("/prognosis/count");
      const r = await API.get("/prognosis/history");

      setDatasetCount(d.data.count);
      setModelCount(m.data.count);
      setPredictionCount(p.data.count);

      setRecentPredictions(r.data.slice(0, 5));
    };

    loadStats();
  }, []);

  return (
    <>
      {/* Main Content */}
      <main className="dashboard-container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">
            <i className="fas fa-chart-line" /> Dashboard
          </h1>
          <p className="page-subtitle">
            Welcome back! Here's your system overview.
          </p>
        </div>
        {/* Statistics Section */}
        <div className="stats-grid">
          <div className="stat-card prim">
            <div className="stat-icon">
              <i className="fas fa-database" />
            </div>
            <div className="stat-value">{datasetCount}</div>
            <div className="stat-label">Total Datasets</div>
          </div>
          <div className="stat-card accent">
            <div className="stat-icon">
              <i className="fas fa-cogs" />
            </div>
            <div className="stat-value">{modelCount}</div>
            <div className="stat-label">Trained Models</div>
          </div>
          <div className="stat-card secondary">
            <div className="stat-icon">
              <i className="fas fa-check-circle" />
            </div>
            <div className="stat-value">{predictionCount}</div>
            <div className="stat-label">Predictions</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-user" />
            </div>
            <div className="stat-value">Admin</div>
            <div className="stat-label">Your Role</div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="dashboard-actions">
          <Link to="/upload-dataset" className="action-card">
            <div className="action-icon">
              <i className="fas fa-cloud-upload-alt" />
            </div>
            <h3 className="action-title">Upload Dataset</h3>
            <p className="action-description">
              Import Excel file and extract parameters automatically
            </p>
          </Link>
          <Link to="/training" className="action-card accent">
            <div className="action-icon">
              <i className="fas fa-graduation-cap" />
            </div>
            <h3 className="action-title">Train Model</h3>
            <p className="action-description">
              Configure and train your neural network model
            </p>
          </Link>
        </div>

        {/* Industrial Modules Section */}
        <div className="industrial-modules">
          <Link to="/prognosis" className="industrial-card prognosis-card">
            <div className="industrial-content">
              <h2>
                {" "}
                <i className="fas fa-brain" /> Defect Prog.
              </h2>
              <p>Predict defect probabilities using AI models</p>
            </div>
          </Link>

          <Link
            to="/property-prognosis"
            className="industrial-card analytics-card"
          >
            <div className="industrial-content">
              <h2>
                {" "}
                <i className="fas fa-cogs" /> Property Prog.
              </h2>
              <p>Predict mechanical properties dynamically</p>
            </div>
          </Link>

          <Link to="/analysis" className="industrial-card prognosis-card">
            <div className="industrial-content">
              <h2>
                {" "}
                <i className="fas fa-search" /> Defect Diag.
              </h2>
              <p>Find root causes of defects</p>
            </div>
          </Link>

          <Link to="/mechanical" className="industrial-card analytics-card">
            <div className="industrial-content">
              <h2>
                {" "}
                <i className="fas fa-wrench" /> Mechanical Diag.
              </h2>
              <p>Analyze mechanical property behavior</p>
            </div>
          </Link>
        </div>
        {/* Recent Predictions Table */}
        <div className="recent-section" style={{ marginTop: "2rem" }}>
          <div className="section-header">
            <h2 className="section-title">
              <i className="fas fa-history" /> Recent Predictions
            </h2>
            <Link to="#">View All</Link>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Model</th>
                <th>Type</th>
                <th>Prediction</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentPredictions.map((item) => {
                let overallProbability = 0;

                if (item.type === "defect") {
                  const defectEntries = Object.entries(
                    item.prediction_results || {},
                  );

                  const highestDefect = defectEntries.reduce(
                    (max, current) =>
                      Number(current[1]?.probability_percent) >
                      Number(max?.[1]?.probability_percent || 0)
                        ? current
                        : max,
                    null,
                  );

                  overallProbability = highestDefect
                    ? Number(highestDefect[1]?.probability_percent || 0)
                    : 0;
                } else {
                  // PROPERTY MODE
                  const values = Object.values(item.prediction_results || {});

                  overallProbability =
                    values.length > 0
                      ? values.reduce((a, b) => a + Number(b), 0) /
                        values.length
                      : 0;
                }

                const risk =
                  overallProbability > 70
                    ? "High"
                    : overallProbability > 40
                      ? "Medium"
                      : "Low";

                const riskColor =
                  overallProbability > 70
                    ? "#ef4444"
                    : overallProbability > 40
                      ? "#f59e0b"
                      : "#10b981";

                return (
                  <tr key={item._id}>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>

                    <td>{item.modelUsed}</td>

                    <td>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "20px",
                          background:
                            item.type === "defect" ? "#fee2e2" : "#dbeafe",
                          color: item.type === "defect" ? "#b91c1c" : "#1d4ed8",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                        }}
                      >
                        {item.type === "defect" ? "Defect" : "Property"}
                      </span>
                    </td>
                    <td>{overallProbability.toFixed(2)}%</td>

                    <td>
                      <span
                        style={{
                          color: riskColor,
                          fontWeight: 600,
                        }}
                      >
                        {risk} Risk
                      </span>
                    </td>

                    <td>
                      <Link
                        to="/result"
                        onClick={() =>
                          localStorage.setItem(
                            "predictionResult",
                            JSON.stringify(item),
                          )
                        }
                        style={{
                          color: "var(--primary-light)",
                          textDecoration: "none",
                        }}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
};

export default Dashboard;
