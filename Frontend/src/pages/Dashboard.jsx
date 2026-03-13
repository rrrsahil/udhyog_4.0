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
        {/* <div className="dashboard-actions">
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
          <Link to="/prognosis" className="action-card secondary">
            <div className="action-icon">
              <i className="fas fa-brain" />
            </div>
            <h3 className="action-title">Make Prognosis</h3>
            <p className="action-description">
              Get quality predictions based on your data
            </p>
          </Link>
        </div> */}

        {/* Industrial Modules Section */}
        <div className="industrial-modules">
          <Link to="/mechanical" className="industrial-card analytics-card">
            <div className="industrial-content">
              <h2>Mechanical Analytics</h2>
              <p>
                Analyze the relationship between process parameters and
                mechanical properties.
              </p>
            </div>
          </Link>

          <Link to="/prognosis" className="industrial-card prognosis-card">
            <div className="industrial-content">
              <h2>Quality Prognosis</h2>
              <p>
                Quality prognosis is the solution for deeper trending and
                predictive analytics to bring the future into focus.
              </p>
            </div>
          </Link>

          <Link to="/analysis" className="industrial-card analytics-card">
            <div className="industrial-content">
              <h2>Data Analytics</h2>
              <p>
                Data Analytics is the solution for identification of critical
                parameters and their specific range of values to achieve desired
                quality.
              </p>
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
                <th>Prediction</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentPredictions.map((item) => {
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

                const overallProbability = highestDefect
                  ? Number(highestDefect[1]?.probability_percent || 0)
                  : 0;

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
