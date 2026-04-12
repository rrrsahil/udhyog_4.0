import React from "react";
import "../css/help.css";

const Help = () => {
  return (
    <main className="help-page-container">
      {/* HEADER */}
      <div className="help-page-header">
        <h1 className="help-page-title">
          <i className="fas fa-question-circle"></i> Help & Support
        </h1>
        <p className="help-page-subtitle">
          Complete guide to use the AI-based Quality Prognosis System
        </p>
      </div>

      {/* SYSTEM WORKFLOW */}
      <section className="help-card help-workflow-section">
        <h2>
          <i className="fas fa-project-diagram"></i> System Workflow
        </h2>

        <ol className="help-workflow-list">
          <li>
            <strong>Upload Dataset</strong> → Import dataset (.csv/.xlsx)
          </li>
          <li>
            <strong>Train Model</strong> → Configure neural network
          </li>
          <li>
            <strong>Run Prognosis</strong> → Enter input values
          </li>
          <li>
            <strong>View Results</strong> → Analyze defect probability
          </li>
          <li>
            <strong>Diagnosis</strong> → Identify root cause
          </li>
          <li>
            <strong>Property Prediction</strong> → Predict properties
          </li>
        </ol>

        {/* 🔥 VISUAL WORKFLOW */}
        <div className="workflow-visual">
          <div className="step">Upload</div>
          <div className="arrow">→</div>
          <div className="step">Train</div>
          <div className="arrow">→</div>
          <div className="step">Predict</div>
          <div className="arrow">→</div>
          <div className="step">Analyze</div>
        </div>
      </section>

      {/* MODULES */}
      <section className="help-card">
        <h2>
          <i className="fas fa-layer-group"></i> System Modules
        </h2>

        <ul className="help-fileformat-list">
          <li>
            <strong>Prognosis:</strong> Predict defect probability
          </li>
          <li>
            <strong>Diagnosis:</strong> Identify critical parameters
          </li>
          <li>
            <strong>Mechanical:</strong> Analyze material properties
          </li>
          <li>
            <strong>Property Prediction:</strong> Forecast outputs dynamically
          </li>
        </ul>
      </section>

      {/* FILE FORMAT */}
      <section className="help-card help-fileformat-section">
        <h2>
          <i className="fas fa-file-excel"></i> Supported File Formats
        </h2>

        <ul className="help-fileformat-list">
          <li>.xlsx (Excel)</li>
          <li>.xls (Excel legacy)</li>
          <li>.csv (Comma separated values)</li>
        </ul>
      </section>

      {/* TROUBLESHOOTING */}
      <section className="help-card help-troubleshoot-section">
        <h2>
          <i className="fas fa-tools"></i> Troubleshooting
        </h2>

        <ul className="help-troubleshoot-list">
          <li>Dataset must contain valid column headers</li>
          <li>All input values must be numeric</li>
          <li>Model must be trained before prediction</li>
          <li>Restart ML service if API fails</li>
          <li>Ensure input matches training features</li>
        </ul>

        {/* ⚠️ WARNING BOX */}
        <div className="warning-box">
          ⚠️ Important: Train the model before prediction.
          <br />
          ⚠️ Column names must exactly match training dataset.
        </div>
      </section>

      {/* FAQ */}
      <section className="help-card help-faq-section">
        <h2>
          <i className="fas fa-list"></i> Frequently Asked Questions
        </h2>

        <p>
          <strong>How accurate is prediction?</strong>
        </p>
        <p>Accuracy depends on dataset quality and training configuration.</p>

        <p>
          <strong>Can I retrain the model?</strong>
        </p>
        <p>Yes, you can retrain anytime using new datasets.</p>

        <p>
          <strong>Why am I getting errors or 0%?</strong>
        </p>
        <p>
          This usually happens due to incorrect inputs, missing columns, or ML
          service issues.
        </p>
      </section>

      {/* CONTACT */}
      <section className="help-card help-contact-section">
        <h2>
          <i className="fas fa-headset"></i> Contact Support
        </h2>

        <p>Email: support@qps.com</p>
        <p>Phone: +91-XXXXXXXXXX</p>

        <p style={{ marginTop: "10px", fontSize: "0.9rem", opacity: 0.8 }}>
          For technical issues, share dataset and error screenshot.
        </p>

        {/* 🔥 ACTION BUTTONS */}
        <div className="help-actions">
          <a href="/upload-dataset" className="help-btn">
            Upload Dataset
          </a>
          <a href="/training" className="help-btn">
            Train Model
          </a>
          <a href="/prognosis" className="help-btn">
            Run Prediction
          </a>
          <a href="/result" className="help-btn">
            Result
          </a>
        </div>
      </section>
    </main>
  );
};

export default Help;
