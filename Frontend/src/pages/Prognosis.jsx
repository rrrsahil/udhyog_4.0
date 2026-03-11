import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import { toast } from "react-toastify";
import {
  getContract,
  getCurrentAccount,
  generateHash,
  getEtherscanUrl,
} from "../utils/web3";

const Prognosis = () => {
  const navigate = useNavigate();

  const [columns, setColumns] = useState([]);
  const [activeModel, setActiveModel] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [blockchainTxHash, setBlockchainTxHash] = useState("");

  /* LOAD MODEL + DATASET COLUMNS */
  const loadModel = async () => {
    try {
      const res = await API.get("/training/latest");

      if (!res?.data) return;

      setActiveModel(res.data);

      const datasetColumns = res.data?.dataset?.columns;

      if (Array.isArray(datasetColumns) && datasetColumns.length >= 7) {
        const inputColumns = datasetColumns.slice(6);

        setColumns(inputColumns);
        setSelectedColumns(inputColumns);
      } else {
        setColumns([]);
        setSelectedColumns([]);
      }
    } catch (err) {
      console.error("Model load error:", err);
      toast.error("No trained model available");
    }
  };

  /* LOAD HISTORY */
  const loadHistory = async () => {
    try {
      const res = await API.get("/prognosis/history");
      setHistory(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadModel();
      await loadHistory();
    };

    init();
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
      inputs[c] = parseFloat(form[c].value || 0);
    });

    try {
      const res = await API.post("/prognosis/predict", { inputs });

      localStorage.setItem("predictionResult", JSON.stringify(res.data));

      toast.success("Prediction generated successfully");

      await loadHistory();

      // Record prediction on blockchain
      await recordPredictionOnBlockchain(res.data);

      navigate("/result");
    } catch (err) {
      console.error("Prediction error:", err);
      toast.error("Prediction failed");
    }
  };

  /* RECORD PREDICTION ON BLOCKCHAIN */
  const recordPredictionOnBlockchain = async (predictionData) => {
    try {
      const account = await getCurrentAccount();
      if (!account) {
        console.log("Wallet not connected, skipping blockchain recording");
        return;
      }

      const blockchainTrainingId = localStorage.getItem(
        "lastBlockchainTrainingId",
      );
      if (!blockchainTrainingId) {
        console.log("No blockchain training ID found");
        return;
      }

      toast.info("Recording prediction on blockchain...");

      const contract = await getContract();
      const predictionHash = generateHash(
        JSON.stringify(predictionData) + Date.now(),
      );

      const tx = await contract.recordPrediction(
        parseInt(blockchainTrainingId),
        predictionHash,
      );

      toast.info("Transaction submitted. Waiting for confirmation...");
      await tx.wait();

      setBlockchainTxHash(tx.hash);
      toast.success(
        <div>
          Prediction recorded on blockchain!
          <br />
          <a
            href={getEtherscanUrl(tx.hash)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#fff", textDecoration: "underline" }}
          >
            View on Etherscan
          </a>
        </div>,
        { autoClose: 8000 },
      );
    } catch (error) {
      console.error("Blockchain error:", error);
      if (error.code !== "ACTION_REJECTED") {
        toast.error("Failed to record prediction on blockchain");
      }
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

          {blockchainTxHash && (
            <div
              style={{
                background: "#d4edda",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "20px",
                fontSize: "14px",
                border: "1px solid #c3e6cb",
              }}
            >
              <b>✓ Prediction Recorded on Blockchain!</b>
              <br />
              <a
                href={getEtherscanUrl(blockchainTxHash)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#155724", textDecoration: "underline" }}
              >
                View Transaction on Etherscan
              </a>
            </div>
          )}

          {/* PARAMETER SELECTOR */}
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
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
                gap: "10px",
              }}
            >
              {Array.isArray(columns) &&
                columns.map((col) => (
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
                      step="0.0001"
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
                <th>Probability</th>
                <th>Risk</th>
                <th>Model</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="6">No history available</td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item._id}>
                    <td>{new Date(item.createdAt).toLocaleString()}</td>

                    <td>
                      {item.prediction_results &&
                        Object.entries(item.prediction_results).map(
                          ([key, value]) => (
                            <div key={key}>
                              <strong>{key}:</strong>{" "}
                              {value?.prediction === 1
                                ? "Defective"
                                : "Non-Defective"}
                            </div>
                          ),
                        )}
                    </td>

                    <td>
                      {item.prediction_results &&
                        Object.entries(item.prediction_results).map(
                          ([key, value]) => (
                            <div key={key}>
                              {key}: {value?.probability_percent ?? 0}%
                            </div>
                          ),
                        )}
                    </td>

                    <td>
                      {item.prediction_results &&
                        Object.entries(item.prediction_results).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              style={{
                                color:
                                  value?.risk_level === "High"
                                    ? "red"
                                    : value?.risk_level === "Medium"
                                      ? "orange"
                                      : "green",
                                fontWeight: "bold",
                              }}
                            >
                              {key}: {value?.risk_level ?? "Unknown"}
                            </div>
                          ),
                        )}
                    </td>

                    <td>{item.modelUsed}</td>

                    <td>
                      <Link
                        to="/result"
                        style={{ marginLeft: "15px" }}
                        onClick={() => {
                          localStorage.setItem(
                            "predictionResult",
                            JSON.stringify(item),
                          );
                        }}
                      >
                        View
                      </Link>
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
