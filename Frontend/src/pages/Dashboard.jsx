import React from "react";
import { Link, NavLink } from "react-router-dom";

const Dashboard = () => {
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
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-database" />
            </div>
            <div className="stat-value">5</div>
            <div className="stat-label">Total Datasets</div>
          </div>
          <div className="stat-card accent">
            <div className="stat-icon">
              <i className="fas fa-cogs" />
            </div>
            <div className="stat-value">3</div>
            <div className="stat-label">Trained Models</div>
          </div>
          <div className="stat-card secondary">
            <div className="stat-icon">
              <i className="fas fa-check-circle" />
            </div>
            <div className="stat-value">24</div>
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
          <Link to="/prognosis" className="action-card secondary">
            <div className="action-icon">
              <i className="fas fa-brain" />
            </div>
            <h3 className="action-title">Make Prognosis</h3>
            <p className="action-description">
              Get quality predictions based on your data
            </p>
          </Link>
        </div>
        {/* Upload Dataset Section */}

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
                <th>Dataset</th>
                <th>Model</th>
                <th>Prediction</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2024-02-05</td>
                <td>Manufacturing Data</td>
                <td>Neural Network v2</td>
                <td>92% Quality</td>
                <td>
                  <span style={{ color: "#155724", fontWeight: 500 }}>
                    ✓ Success
                  </span>
                </td>
                <td>
                  <Link
                    to="/result"
                    style={{
                      color: "var(--primary-light)",
                      textDecoration: "none",
                    }}
                  >
                    View
                  </Link>
                </td>
              </tr>
              <tr>
                <td>2024-02-04</td>
                <td>Process Parameters</td>
                <td>Neural Network v1</td>
                <td>88% Quality</td>
                <td>
                  <span style={{ color: "#155724", fontWeight: 500 }}>
                    ✓ Success
                  </span>
                </td>
                <td>
                  <Link
                    to="/result"
                    style={{
                      color: "var(--primary-light)",
                      textDecoration: "none",
                    }}
                  >
                    View
                  </Link>
                </td>
              </tr>
              <tr>
                <td>2024-02-03</td>
                <td>Production Metrics</td>
                <td>Neural Network v2</td>
                <td>85% Quality</td>
                <td>
                  <span style={{ color: "#155724", fontWeight: 500 }}>
                    ✓ Success
                  </span>
                </td>
                <td>
                  <Link
                    to="/result"
                    style={{
                      color: "var(--primary-light)",
                      textDecoration: "none",
                    }}
                  >
                    View
                  </Link>
                </td>
              </tr>
              <tr>
                <td>2024-02-02</td>
                <td>Quality Control</td>
                <td>Neural Network v1</td>
                <td>90% Quality</td>
                <td>
                  <span style={{ color: "#155724", fontWeight: 500 }}>
                    ✓ Success
                  </span>
                </td>
                <td>
                  <Link
                    to="/result"
                    style={{
                      color: "var(--primary-light)",
                      textDecoration: "none",
                    }}
                  >
                    View
                  </Link>
                </td>
              </tr>
              <tr>
                <td>2024-02-01</td>
                <td>Assembly Data</td>
                <td>Neural Network v2</td>
                <td>87% Quality</td>
                <td>
                  <span style={{ color: "#155724", fontWeight: 500 }}>
                    ✓ Success
                  </span>
                </td>
                <td>
                  <Link
                    to="/result"
                    style={{
                      color: "var(--primary-light)",
                      textDecoration: "none",
                    }}
                  >
                    View
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
};

export default Dashboard;
