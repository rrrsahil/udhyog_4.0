import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Doughnut } from "react-chartjs-2";
import jsPDF from "jspdf";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import API from "../api/api";
import "../css/result.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const Result = () => {
  const [result, setResult] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("predictionResult");
    if (data) setResult(JSON.parse(data));
    loadModelInfo();
  }, []);

  const loadModelInfo = async () => {
    try {
      if (!result?.modelUsed) return;

      const res = await API.get("/training/history/all");
      const matched = res.data.find((t) => t.algorithm === result.modelUsed);

      if (matched) setModelInfo(matched);
    } catch (err){
      console.log("Error fetching model info:", err);
    }
  };

  if (!result || !result.prediction_results) {
    return (
      <div className="result-empty">
        <h2>No prediction result found</h2>
      </div>
    );
  }

  const timestamp = new Date(result?.createdAt || new Date().getTime()).toLocaleString();

  const defectEntries = Object.entries(result.prediction_results);

  const overallProbability =
    defectEntries.length > 0
      ? defectEntries.reduce(
          (sum, [, v]) => sum + Number(v?.probability_percent || 0),
          0,
        ) / defectEntries.length
      : 0;

  const highestDefect = defectEntries.reduce(
    (max, current) =>
      Number(current[1]?.probability_percent) >
Number(max?.[1]?.probability_percent || 0)
        ? current
        : max,
    null,
  );

  const getRiskColor = (prob) => {
    if (prob > 70) return "#ef4444";
    if (prob > 40) return "#f59e0b";
    return "#10b981";
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text("AI Multi-Defect Prediction Report", 20, y);
    y += 12;

    doc.setFontSize(12);
    doc.text(`Generated At: ${timestamp}`, 20, y);
    y += 8;

    doc.text(
      `Overall Defect Probability: ${overallProbability.toFixed(2)}%`,
      20,
      y,
    );
    y += 12;

    if (highestDefect) {
      doc.text(
        `Highest Risk Defect: ${highestDefect[0]} (${highestDefect[1].probability_percent}%)`,
        20,
        y,
      );
      y += 12;
    }

    defectEntries.forEach(([defect, values]) => {
      doc.text(`Defect: ${defect}`, 20, y);
      y += 6;
      doc.text(`Probability: ${values.probability_percent}%`, 25, y);
      y += 6;
      doc.text(`Risk: ${values.risk_level}`, 25, y);
      y += 10;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save("Multi_Defect_Report.pdf");
  };

  return (
    <div className="result-container">
      {/* HEADER */}
      <div className="result-status good">
        <h2>Multi-Defect Analysis</h2>
        <p style={{ color: "white" }}>Generated At: {timestamp}</p>
        <h3>Overall Defect Probability: {overallProbability.toFixed(2)}%</h3>
        {highestDefect && (
          <p style={{ color: "white" }}>
            Highest Risk: <strong>{highestDefect[0]}</strong> (
            {highestDefect[1].probability_percent}%)
          </p>
        )}
      </div>

      {/* DEFECT GRID */}
      <div className="defect-grid">
        {/* OVERALL DEFECT CARD */}
        <div className="card defect-card">
          <h3>Overall Defect</h3>

          <div className="gauge-wrapper">
            <Doughnut
              data={{
                datasets: [
                  {
                    data: [overallProbability, 100 - overallProbability],
                    backgroundColor: [
                      getRiskColor(overallProbability),
                      "#e5e7eb",
                    ],
                    borderWidth: 0,
                  },
                ],
              }}
            />
            <div className="gauge-center">{overallProbability.toFixed(2)}%</div>
          </div>

          <div
            className="risk-badge"
            style={{
              background: getRiskColor(overallProbability),
            }}
          >
            Overall Risk
          </div>
        </div>

        {/* INDIVIDUAL DEFECT CARDS */}
        {defectEntries.map(([defect, values]) => {
          const riskColor = getRiskColor(values.probability_percent);

          return (
            <div className="card defect-card" key={defect}>
              <h3>{defect}</h3>

              <div className="gauge-wrapper">
                <Doughnut
                  data={{
                    datasets: [
                      {
                        data: [
                          values.probability_percent,
                          100 - values.probability_percent,
                        ],
                        backgroundColor: [riskColor, "#e5e7eb"],
                        borderWidth: 0,
                      },
                    ],
                  }}
                />
                <div className="gauge-center">
                  {Number(values.probability_percent).toFixed(2)}%
                </div>
              </div>

              <div className="risk-badge" style={{ background: riskColor }}>
                {values.prediction === 1 ? "Defective" : "Non-Defective"} |{" "}
                {values.risk_level} Risk
              </div>
            </div>
          );
        })}
      </div>

      {/* AI EXPLANATION */}
      <div className="card">
        <h3>AI Explanation</h3>
        <p className="explanation-text">
          The trained neural network evaluated{" "}
          <strong>{Object.keys(result.inputs || {}).length || 0}</strong> operational
          input parameters to estimate the likelihood of defect occurrence
          across all target categories.
          <br />
          <br />
          The computed <strong>overall defect probability</strong> is{" "}
          <strong>{overallProbability.toFixed(2)}%</strong>, which represents
          the average predicted risk across all monitored defects.
          <br />
          <br />
          {highestDefect && (
            <>
              The model indicates that the most critical risk currently lies in{" "}
              <strong>{highestDefect[0]}</strong> with a predicted probability
              of{" "}
              <strong>
                {Number(highestDefect[1].probability_percent).toFixed(2)}%
              </strong>
              .
              <br />
              <br />
            </>
          )}
          Higher probability values suggest increased defect likelihood and may
          require process optimization or corrective industrial action.
        </p>
      </div>

      {/* MODEL INFO */}
      {modelInfo && (
        <div className="card">
          <h3>Model Information</h3>
          <div className="model-grid">
            <div>
              <span>Algorithm</span>
              <strong>{modelInfo.algorithm}</strong>
            </div>
            <div>
              <span>Training Accuracy</span>
              <strong>{modelInfo.accuracy}%</strong>
            </div>
            <div>
              <span>Cross Validation</span>
              <strong>{modelInfo.cross_val_accuracy}%</strong>
            </div>
            <div>
              <span>Total Targets</span>
              <strong>{defectEntries.length}</strong>
            </div>
          </div>
        </div>
      )}

      {/* INPUT TABLE */}
      <div className="card">
        <h3>Input Parameters</h3>
        <div className="table-wrapper limited-height">
          <table className="input-table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(result.inputs || {}).map(([key, value]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="actions">
        <button onClick={handleDownload} className="btn-download">
          Download PDF
        </button>

        <Link to="/prognosis" className="btn-primary">
          New Prediction
        </Link>

        <Link to="/dashboard" className="btn-secondary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Result;
