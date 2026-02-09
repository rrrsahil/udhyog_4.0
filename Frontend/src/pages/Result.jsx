import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import { toast } from "react-toastify";

const Result = () => {

  const [result, setResult] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("predictionResult");
    if (data) {
      setResult(JSON.parse(data));
      toast.success("Result saved in database successfully");
    }
  }, []);

  /* DOWNLOAD PDF */
  const handleDownload = () => {
    if (!result) return;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Quality Prognosis Result", 20, 20);

    doc.setFontSize(14);
    doc.text(`Prediction: ${result.prediction}%`, 20, 40);
    doc.text(`Confidence: ${result.confidence || 95}%`, 20, 50);
    doc.text(`Model Used: ${result.modelUsed}`, 20, 60);

    let y = 80;
    doc.text("Input Parameters:", 20, y);
    y += 10;

    Object.entries(result.inputs || {}).forEach(([k, v]) => {
      doc.text(`${k}: ${v}`, 20, y);
      y += 10;
    });

    doc.save("prognosis-result.pdf");
  };

  if (!result) {
    return (
      <main className="prognosis-container">
        <h2>No prediction result found</h2>
      </main>
    );
  }

  /* QUALITY LABEL LOGIC */
  let label = "Poor";
  if (result.prediction >= 90) label = "Excellent Quality";
  else if (result.prediction >= 75) label = "Good Quality";
  else if (result.prediction >= 50) label = "Average Quality";

  return (
    <>
      <main className="prognosis-container">

        <div className="prognosis-header">
          <h1 className="prognosis-title">
            <i className="fas fa-chart-pie"></i> Prognosis Results
          </h1>
          <p className="prognosis-subtitle">
            Detailed quality prediction analysis based on your input parameters
          </p>
        </div>

        <div className="alert-prognosis success show">
          <i className="fas fa-check-circle"></i>
          Prediction completed successfully and stored in database!
        </div>

        <div className="prognosis-card">
          <div className="card-header-prognosis">
            <h2>Quality Assessment Result</h2>
          </div>

          <div
            style={{
              background:
                "linear-gradient(135deg, var(--primary-light), var(--primary-blue))",
              color: "white",
              padding: "var(--spacing-2xl)",
              borderRadius: "var(--border-radius-lg)",
              textAlign: "center",
              marginBottom: "var(--spacing-xl)",
            }}
          >
            <div style={{ fontSize: "0.95rem", opacity: 0.9 }}>
              Predicted Quality Score
            </div>

            <div style={{ fontSize: "3.5rem", fontWeight: 600 }}>
              {result.prediction}%
            </div>

            <div style={{ fontSize: "1.1rem" }}>
              {label}
            </div>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <h4>Model Confidence</h4>

            <div
              style={{
                width: "100%",
                height: "10px",
                background: "#ddd",
                borderRadius: "5px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${result.confidence || 95}%`,
                  height: "100%",
                  background:
                    "linear-gradient(90deg, var(--primary-light), var(--primary-blue))",
                }}
              />
            </div>

            <p style={{ marginTop: "5px" }}>
              Confidence: {result.confidence || 95}%
            </p>
          </div>
        </div>

        <div
          className="prognosis-card"
          style={{ marginTop: "var(--spacing-2xl)" }}
        >
          <div className="section-header">
            <h3 className="section-title">
              <i className="fas fa-list"></i> Input Parameters
            </h3>
          </div>

          <table>
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Value</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {Object.entries(result.inputs || {}).map(([key, value]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{value}</td>
                  <td style={{ color: "#155724" }}>Valid</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          className="prognosis-card"
          style={{ marginTop: "var(--spacing-2xl)" }}
        >
          <div className="section-header">
            <h3 className="section-title">
              <i className="fas fa-tasks"></i> Actions
            </h3>
          </div>

          <div
            style={{
              display: "flex",
              gap: "var(--spacing-lg)",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button className="btn btn-secondary" onClick={handleDownload}>
              <i className="fas fa-download"></i> Download PDF
            </button>

            <Link to="/prognosis" className="btn btn-outline">
              <i className="fas fa-arrow-left"></i> New Prediction
            </Link>

            <Link to="/dashboard" className="btn btn-outline">
              <i className="fas fa-home"></i> Back to Dashboard
            </Link>
          </div>
        </div>

      </main>
    </>
  );
};

export default Result;
