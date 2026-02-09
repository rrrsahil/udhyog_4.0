import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import { toast } from "react-toastify";

const Prognosis = () => {
  const navigate = useNavigate();

  const [columns, setColumns] = useState([]);
  const [activeModel, setActiveModel] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);

  /* LOAD MODEL + DATASET COLUMNS */
  const loadModel = async () => {
    try {
      const res = await API.get("/training/latest");

      if (!res.data) return;

      setActiveModel(res.data);

      if (res.data.dataset) {
        const ds = await API.get(`/dataset/${res.data.dataset}`);
        setColumns(ds.data.columns || []);
        setSelectedColumns(ds.data.columns || []);
      }
    } catch (err) {
      toast.error("No trained model available");
    }
  };

  /* LOAD HISTORY */
  const loadHistory = async () => {
    try {
      const res = await API.get("/prognosis/history");
      setHistory(res.data || []);
    } catch (err) {}
  };

  useEffect(() => {
    loadModel();
    loadHistory();
  }, []);

  /* COLUMN TOGGLE */
  const toggleColumn = (col) => {
    if (selectedColumns.includes(col)) {
      setSelectedColumns(selectedColumns.filter((c) => c !== col));
    } else {
      setSelectedColumns([...selectedColumns, col]);
    }
  };

  /* SELECT ALL */
  const selectAll = () => {
    setSelectedColumns(columns);
  };

  /* UNSELECT ALL */
  const unselectAll = () => {
    setSelectedColumns([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const inputs = {};

    selectedColumns.forEach((c) => {
      inputs[c] = form[c].value;
    });

    try {
      const res = await API.post("/prognosis/predict", { inputs });

      localStorage.setItem("predictionResult", JSON.stringify(res.data));

      toast.success("Prediction generated successfully");

      await loadHistory();

      navigate("/result");
    } catch (err) {
      toast.error("Prediction failed");
    }
  };

  return (
    <>
      <main className="prognosis-container">
        <div className="prognosis-header">
          <h1 className="prognosis-title">
            <i className="fas fa-brain" /> Quality Prognosis
          </h1>
          <p className="prognosis-subtitle">
            Enter parameter values to get quality predictions from your trained
            model
          </p>
        </div>

        <div className="prognosis-card">
          <div className="card-header-prognosis">
            <h2>Enter Parameter Values</h2>
          </div>

          <div className="alert-prognosis success show">
            <i className="fas fa-check-circle" />
            {activeModel
              ? `Active Model: ${activeModel.algorithm} | Accuracy: ${activeModel.accuracy}%`
              : "No trained model available"}
          </div>

          {/* PARAMETER SELECTOR */}
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px"
              }}
            >
              <strong>Select Parameters:</strong>

              <div>
                <button
                  type="button"
                  onClick={selectAll}
                  className="btn btn-secondary"
                  style={{ marginRight: "10px", padding: "5px 12px" }}
                >
                  Select All
                </button>

                <button
                  type="button"
                  onClick={unselectAll}
                  className="btn btn-secondary"
                  style={{ padding: "5px 12px" }}
                >
                  Unselect All
                </button>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px"
              }}
            >
              {columns.map((col) => (
                <label
                  key={col}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(col)}
                    onChange={() => toggleColumn(col)}
                    style={{ marginRight: "8px" }}
                  />
                  {col}
                </label>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="parameters-section">
              <div className="parameters-grid">
                {selectedColumns.map((col) => (
                  <div className="parameter-card" key={col}>
                    <div className="parameter-label">
                      <i className="fas fa-sliders-h" /> {col}
                    </div>
                    <input
                      type="number"
                      className="parameter-input"
                      name={col}
                      placeholder={`Enter ${col}`}
                      step="0.1"
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="prognosis-actions">
              <button type="reset" className="btn btn-secondary">
                <i className="fas fa-redo" /> Reset
              </button>
              <button type="submit" className="btn btn-primary btn-large">
                <i className="fas fa-magic" /> Get Prognosis
              </button>
            </div>
          </form>
        </div>

        <div className="prognosis-card" style={{ marginTop: "2rem" }}>
          <h3>
            <i className="fas fa-history" /> Recent Prognosis Results
          </h3>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Prediction</th>
                <th>Model</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="4">No history available</td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item._id}>
                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                    <td>{item.prediction}%</td>
                    <td>{item.modelUsed}</td>
                    <td>
                      <Link to="/result">View</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
};

export default Prognosis;
