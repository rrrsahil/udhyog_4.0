import React, { useEffect, useState } from "react";
import API from "../api/api";
import { toast } from "react-toastify";
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

const PropertyPrognosis = () => {
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState("");

  const [, setColumns] = useState([]);
  const [inputColumns, setInputColumns] = useState([]);
  const [targetColumns, setTargetColumns] = useState([]);

  const [selectedInputs, setSelectedInputs] = useState([]);
  const [selectedTargets, setSelectedTargets] = useState([]);

  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [trainingMetrics, setTrainingMetrics] = useState(null);
  const [progress, setProgress] = useState(0);

  /* LOAD DATASETS */
  useEffect(() => {
    const loadDatasets = async () => {
      try {
        const res = await API.get("/dataset");
        setDatasets(res.data);
      } catch (err) {
        toast.error("Failed to load datasets");
        console.error(err);
      }
    };
    loadDatasets();
  }, []);

  /* HANDLE DATASET */
  const handleDatasetChange = (datasetId) => {
    setSelectedDataset(datasetId);
    setTrainingMetrics(null);
    setPredictionResult(null);

    const ds = datasets.find((d) => d._id === datasetId);
    if (!ds || !ds.columns) return;

    const cols = ds.columns;
    setColumns(cols);

    const targets = cols.slice(1, 6);
    const inputs = cols.slice(6);

    setInputColumns(inputs);
    setTargetColumns(targets);

    setSelectedInputs(inputs);
    setSelectedTargets(targets);
  };

  /* TOGGLE */
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

  /* SELECT ALL */
  const selectAllInputs = () => setSelectedInputs(inputColumns);
  const unselectAllInputs = () => setSelectedInputs([]);

  const selectAllTargets = () => setSelectedTargets(targetColumns);
  const unselectAllTargets = () => setSelectedTargets([]);

  /* TRAIN */
  const trainModel = async () => {
    if (!selectedDataset) {
      toast.error("Select dataset first");
      return;
    }

    try {
      setLoading(true);
      setProgress(30);

      const res = await API.post("/property/train", {
        datasetId: selectedDataset,
        inputColumns: selectedInputs,
        targetColumns: selectedTargets,
      });

      setProgress(80);

      setTrainingMetrics(res.data.metrics);

      setProgress(100);
      toast.success("Model trained successfully");
    } catch (err) {
      toast.error("Training failed");
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1500);
    }
  };

  /* PREDICT */
  const handlePredict = async (e) => {
    e.preventDefault();

    if (!trainingMetrics) {
      toast.error("Train model first");
      return;
    }

    const form = e.target;
    const inputs = {};

    selectedInputs.forEach((col) => {
      inputs[col] = parseFloat(form[col].value || 0);
    });

    try {
      setLoading(true);

      const res = await API.post("/property/predict", {
        inputs, // backend expects this
      });

      setPredictionResult(res.data.predictions);
      toast.success("Prediction completed");
    } catch (err) {
      toast.error("Prediction failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* CHART */
const barColors = [
  "#0ea5e9", // blue
  "#6366f1", // indigo
  "#22c55e", // green
  "#f59e0b", // orange
  "#ef4444", // red
  "#14b8a6", // teal
  "#a855f7", // purple
  "#f97316", // orange dark
  "#10b981", // emerald
  "#3b82f6", // blue light
];

const chartData = predictionResult
  ? {
      labels: Object.keys(predictionResult),
      datasets: [
        {
          label: "Predicted Values",
          data: Object.values(predictionResult).map((v) => v.predicted_value),

          // 🔥 MULTI COLOR
          backgroundColor: Object.keys(predictionResult).map(
            (_, i) => barColors[i % barColors.length]
          ),
        },
      ],
    }
  : null;

  return (
    <main className="dashboard-container">
      <div className="page-header">
        <h1 className="page-title">
          <i className="fas fa-chart-line"></i> Property Prognosis
        </h1>
        <p className="page-subtitle">
          Predict mechanical properties using regression models
        </p>
      </div>

      {/* DATASET */}
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
      </div>

      {/* INPUTS */}
      {inputColumns.length > 0 && (
        <div className="card mt-3">
          <div className="flex-between mb-2">
            <strong>Select Input Parameters</strong>
            <div>
              <button
                className="btn btn-secondary btn-small"
                onClick={selectAllInputs}
              >
                Select All
              </button>
              <button
                className="btn btn-secondary btn-small"
                onClick={unselectAllInputs}
                style={{ marginLeft: "10px" }}
              >
                Unselect All
              </button>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
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
        </div>
      )}

      {/* TARGETS */}
      {targetColumns.length > 0 && (
        <div className="card mt-3">
          <div className="flex-between mb-2">
            <strong>Select Target Properties</strong>
            <div>
              <button
                className="btn btn-secondary btn-small"
                onClick={selectAllTargets}
              >
                Select All
              </button>
              <button
                className="btn btn-secondary btn-small"
                onClick={unselectAllTargets}
                style={{ marginLeft: "10px" }}
              >
                Unselect All
              </button>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
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
      )}

      {/* TRAIN */}
      {inputColumns.length > 0 && (
        <div className="card mt-3">
          <h3>Step 1: Train Model</h3>

          <button onClick={trainModel} className="btn-primary btn-block">
            {loading ? "Training..." : "Train Model"}
          </button>

          {/* Progress */}
          {progress > 0 && (
            <div className="progress-bar-bg mt-2">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress}%`, background: "#2845D6" }}
              />
            </div>
          )}

          {trainingMetrics && (
            <div className="alert alert-success mt-2">
              MSE: {trainingMetrics.mse} | R²: {trainingMetrics.r2_score}
            </div>
          )}
        </div>
      )}

      {/* INPUT FORM */}
      {selectedInputs.length > 0 && (
        <div className="card mt-3">
          <h3>Step 2: Enter Parameter Values</h3>

          {!trainingMetrics && (
            <div className="alert alert-warning">
              ⚠ Train model first before prediction
            </div>
          )}

          <form onSubmit={handlePredict}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
              }}
            >
              {selectedInputs.map((col) => (
                <div key={col}>
                  <label>{col}</label>
                  <input type="number" name={col} step="any" required />
                </div>
              ))}
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={!trainingMetrics || loading}
              >
                {loading ? "Predicting..." : "Predict Properties"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RESULT */}
      {predictionResult && (
        <div className="card mt-3">
          <h3>Prediction Results</h3>

          <table>
            <thead>
              <tr>
                <th>Property</th>
                <th>Predicted Value</th>
                <th>Level</th>
              </tr>
            </thead>

            <tbody>
              {Object.entries(predictionResult).map(([key, val]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{val.predicted_value}</td>
                  <td>{val.range_level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CHART */}
      {chartData && (
        <div className="card mt-3">
          <h3>Prediction Visualization</h3>
          <div style={{ height: "350px" }}>
            <Bar data={chartData} />
          </div>
        </div>
      )}
    </main>
  );
};

export default PropertyPrognosis;
