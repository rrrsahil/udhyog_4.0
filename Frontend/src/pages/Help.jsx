import React from "react";
import "../css/help.css";

const Help = () => {
  return (
    <>
      <main className="help-page-container">
        {/* Header */}
        <div className="help-page-header">
          <h1 className="help-page-title">
            <i className="fas fa-question-circle"></i> Help & Support
          </h1>
          <p className="help-page-subtitle">
            Learn how to use the Quality Prognosis System effectively
          </p>
        </div>

        {/* Workflow */}
        <section className="help-card help-workflow-section">
          <h2>
            <i className="fas fa-project-diagram"></i> System Workflow
          </h2>
          <ol className="help-workflow-list">
            <li>Upload dataset from Upload Dataset page.</li>
            <li>Train neural network using Training module.</li>
            <li>Enter parameter values in Prognosis page.</li>
            <li>View results and quality prediction instantly.</li>
          </ol>
        </section>

        {/* File formats */}
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

        {/* Troubleshooting */}
        <section className="help-card help-troubleshoot-section">
          <h2>
            <i className="fas fa-tools"></i> Troubleshooting Steps
          </h2>
          <ul className="help-troubleshoot-list">
            <li>Ensure dataset contains column headers.</li>
            <li>Remove missing or non-numeric values.</li>
            <li>Check that model training completed successfully.</li>
            <li>Refresh page if prediction does not appear.</li>
          </ul>
        </section>

        {/* FAQ */}
        <section className="help-card help-faq-section">
          <h2>
            <i className="fas fa-list"></i> Frequently Asked Questions
          </h2>

          <p>
            <strong>How accurate is prediction?</strong>
          </p>
          <p>
            Prediction accuracy depends on dataset quality and training
            configuration.
          </p>

          <p>
            <strong>Can I retrain the model?</strong>
          </p>
          <p>Yes, you can retrain the model anytime using new datasets.</p>
        </section>

        {/* Contact */}
        <section className="help-card help-contact-section">
          <h2>
            <i className="fas fa-headset"></i> Contact Support
          </h2>
          <p>Email: support@qps.com</p>
          <p>Phone: +91-XXXXXXXXXX</p>
        </section>
      </main>
    </>
  );
};

export default Help;
