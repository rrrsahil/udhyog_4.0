import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import { toast } from "react-toastify";
import { getContract, getCurrentAccount, getEtherscanUrl } from "../utils/web3";

const Training = () => {

  /* STATES */
  const [datasets, setDatasets] = useState([]);
  const [, setSelectedDataset] = useState(null);
  const [history, setHistory] = useState([]);
  const [trainingStatus, setTrainingStatus] = useState("");
  const [trainingAccuracy, setTrainingAccuracy] = useState("");
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [neurons, setNeurons] = useState(8);
  const [neuronOptions, setNeuronOptions] = useState([]);
  const [epochRange, setEpochRange] = useState({ min: 10, max: 100 });
  const [epochs, setEpochs] = useState(50);
  const [blockchainTxHash, setBlockchainTxHash] = useState("");
  const [currentTrainingId, setCurrentTrainingId] = useState(null);

  /* LOAD DATASETS */
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const res = await API.get("/dataset");
        setDatasets(res.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load datasets");
      }
    };
    fetchDatasets();
  }, []);

  /* LOAD TRAINING HISTORY */
  const loadHistory = async () => {
    try {
      const res = await API.get("/training/history/all");
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  /* AUTO REFRESH HISTORY EVERY 5s */
  useEffect(() => {
    const interval = setInterval(() => {
      loadHistory();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  /* CLEAR OLD COMPLETED TRAININGS ON MOUNT */
  useEffect(() => {
    const checkAndClearOldTraining = async () => {
      const id = localStorage.getItem("trainingId");
      if (!id) return;

      try {
        const res = await API.get(`/training/${id}`);
        if (res.data.status === "completed") {
          setTrainingStatus("");
          setTrainingAccuracy("");
          setTrainingProgress(0);
          localStorage.removeItem("trainingId");
        } else if (res.data.status === "running") {
          setCurrentTrainingId(id);
        }
      } catch {
        // Training not found, clear it
        localStorage.removeItem("trainingId");
      }
    };

    checkAndClearOldTraining();
  }, []);

  /* RECORD TRAINING ON BLOCKCHAIN */
  const recordTrainingOnBlockchain = useCallback(
    async (trainingData, trainingId) => {
      try {
        // Check if this training has already been recorded on blockchain
        const recordedTrainings = JSON.parse(
          localStorage.getItem("blockchainRecordedTrainings") || "[]",
        );
        if (recordedTrainings.includes(trainingId)) {
          console.log("Training already recorded on blockchain, skipping");
          return;
        }

        const account = await getCurrentAccount();
        if (!account) {
          console.log("Wallet not connected, skipping blockchain recording");
          return;
        }

        const blockchainDatasetId = localStorage.getItem(
          "lastBlockchainDatasetId",
        );
        if (!blockchainDatasetId) {
          console.log("No blockchain dataset ID found");
          toast.warning(
            "Dataset not registered on blockchain. Please upload and save a dataset first.",
          );
          return;
        }

        toast.info("Recording training on blockchain...");

        const contract = await getContract();

        // Convert accuracy to basis points (multiply by 100 to preserve 2 decimals)
        // Example: 98.43% becomes 9843
        const accuracyBasisPoints = Math.round(
          parseFloat(trainingData.accuracy) * 100,
        );

        const tx = await contract.completeTraining(
          parseInt(blockchainDatasetId),
          trainingData.algorithm,
          accuracyBasisPoints,
        );

        toast.info("Transaction submitted. Waiting for confirmation...");
        await tx.wait();

        // Mark this training as recorded
        recordedTrainings.push(trainingId);
        localStorage.setItem(
          "blockchainRecordedTrainings",
          JSON.stringify(recordedTrainings),
        );

        setBlockchainTxHash(tx.hash);
        toast.success(
          <div>
            Training recorded on blockchain!
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

        // Store blockchain training ID
        const trainingCount = await contract.trainingCount();
        localStorage.setItem(
          "lastBlockchainTrainingId",
          trainingCount.toString(),
        );
      } catch (error) {
        console.error("Blockchain error:", error);
        if (error.code !== "ACTION_REJECTED") {
          toast.error(
            "Failed to record training on blockchain: " +
              (error.message || "Unknown error"),
          );
        } else {
          toast.info("Transaction rejected by user");
        }
      }
    },
    [],
  );

  /* CHECK TRAINING STATUS (AUTO AFTER REFRESH ALSO) */
  useEffect(() => {
    if (!currentTrainingId) return;

    let hasRecorded = false;

    const interval = setInterval(async () => {
      try {
        const res = await API.get(`/training/${currentTrainingId}`);

        setTrainingStatus(res.data.status || "");
        setTrainingAccuracy(res.data.accuracy || "");
        setTrainingProgress(res.data.progress || 0);

        if (res.data.status === "completed" && !hasRecorded) {
          hasRecorded = true;
          clearInterval(interval);
          loadHistory();
          recordTrainingOnBlockchain(res.data, currentTrainingId);
        }
      } catch {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTrainingId, recordTrainingOnBlockchain]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;

    const data = {
      algorithm: form.algorithm.value,
      datasetId: form.dataset.value,
      neurons: Number(neurons),
      layers: Number(form.layers.value),
      transfer: form.transfer.value,
      epochs: Number(epochs),
      learningrate: Number(form.learningrate.value),
      batchsize: Number(form.batchsize.value),
    };

    try {
      setBlockchainTxHash("");

      const res = await API.post("/training/start", data);

      const newTrainingId = res.data.trainingId;
      localStorage.setItem("trainingId", newTrainingId);
      setCurrentTrainingId(newTrainingId);

      setTrainingStatus("running");
      setTrainingAccuracy("");
      setTrainingProgress(0);

      toast.success("Training complete successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Training failed");
    }
  };

  return (
    <>
      <main className="training-container">
        <div className="training-header">
          <h1 className="training-title">
            <i className="fas fa-graduation-cap" /> Train Neural Network
          </h1>
          <p className="training-subtitle">
            Configure and train your model with custom parameters
          </p>
        </div>

        <div className="training-card">
          <div className="info-box">
            <i className="fas fa-info-circle" />
            Configure the neural network parameters and click "Train Network" to
            start the training process.
          </div>

          {trainingStatus && (
            <div className="alert alert-info" style={{ marginBottom: "20px" }}>
              Training Status: <b>{trainingStatus}</b>
              {trainingAccuracy ? (
                <>
                  {" "}
                  | Accuracy: <b>{trainingAccuracy}%</b>
                </>
              ) : null}
              <div
                style={{
                  marginTop: "10px",
                  width: "100%",
                  height: "12px",
                  background: "#e0e0e0",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${trainingProgress}%`,
                    height: "100%",
                    background: "#007bff",
                    transition: "width 0.5s linear",
                  }}
                ></div>
              </div>
              <div style={{ marginTop: "5px", fontSize: "13px" }}>
                {trainingProgress}% completed
              </div>
            </div>
          )}

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
              <b>✓ Training Recorded on Blockchain!</b>
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

          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3 className="form-section-title">
                <i className="fas fa-cog" /> Algorithm Settings
              </h3>

              {/* FIX: 1 Row 2 Column Layout */}
              <div className="form-row-two-col">
                <div className="form-group-training">
                  <label htmlFor="algorithm">Training Algorithm</label>
                  <select id="algorithm" name="algorithm" required>
                    <option value="Back Propagation">Back Propagation (SGD) </option>
                    <option value="Momentum & Adaptive Learning">Momentum & Adaptive Learning (SGD + Momentum) </option>
                    <option value="Adam">Adam Optimizer</option>
                    <option value="Bayesian Regularization">Bayesian Regularization (L2)</option>
                    <option value="Quasi-Newton (L-BFGS)">Quasi-Newton (L-BFGS)</option>
                  </select>
                </div>

                <div className="form-group-training">
                  <label htmlFor="dataset">Select Dataset</label>
                  <select
                    name="dataset"
                    required
                    onChange={(e) => {
                      const id = e.target.value;
                      const ds = datasets.find((d) => d._id === id);
                      if (!ds) return;

                      setSelectedDataset(ds);

                      // Sir format: Heat(0) + Targets(1-5) + Inputs(6+)
                      const inputColumns = ds.columns
                        ? ds.columns.slice(6)
                        : [];

                      const inputCount = inputColumns.length;

                      if (inputCount === 0) {
                        setNeuronOptions([2, 4, 8]);
                        setNeurons(2);
                        return;
                      }

                      // Hidden neurons suggestion formula
                      const minNeurons = Math.max(
                        4,
                        Math.floor(inputCount * 0.5),
                      );
                      const maxNeurons = Math.max(
                        minNeurons + 5,
                        inputCount * 2,
                      );

                      let options = [];
                      for (let i = minNeurons; i <= maxNeurons; i++) {
                        options.push(i);
                      }

                      setNeuronOptions(options);
                      setNeurons(options[0]);

                      // Epoch scaling
                      const minEpoch = 20;
                      const maxEpoch = 300;

                      setEpochRange({ min: minEpoch, max: maxEpoch });
                      setEpochs(minEpoch);
                    }}
                  >
                    <option value="">Choose dataset</option>
                    {datasets.map((ds) => (
                      <option key={ds._id} value={ds._id}>
                        {ds.fileName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">
                <i className="fas fa-project-diagram" /> Network Architecture
              </h3>

              <div className="form-row-two-col">
                <div className="form-group-training">
                  <label htmlFor="neurons">Number of Neurons</label>
                  <select
                    id="neurons"
                    name="neurons"
                    value={neurons}
                    onChange={(e) => setNeurons(Number(e.target.value))}
                    disabled={neuronOptions.length === 0}
                  >
                    {neuronOptions.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group-training">
                  <label htmlFor="layers">Number of Hidden Layers</label>
                  <select id="layers" name="layers" defaultValue={1}>
                    {[1, 2].map((layer) => (
                      <option key={layer} value={layer}>
                        {layer}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">
                <i className="fas fa-sliders-h" /> Training Parameters
              </h3>

              <div className="form-row-two-col">
                <div className="form-group-training">
                  <label htmlFor="transfer">Transfer Function</label>
                  <select id="transfer" name="transfer" required>
                    <option value="">Select a function</option>
                    <option value="sigmoid">Sigmoid</option>
                    <option value="relu">ReLU</option>
                    <option value="tanh">Tanh</option>
                  </select>
                </div>

                <div className="form-group-training">
                  <label htmlFor="epochs">Epochs</label>
                  <input
                    type="number"
                    id="epochs"
                    name="epochs"
                    value={epochs}
                    min={epochRange.min}
                    max={epochRange.max}
                    onChange={(e) => setEpochs(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="form-row-two-col">
                <div className="form-group-training">
                  <label htmlFor="learningrate">Learning Rate</label>
                  <select name="learningrate">
                    <option value="0.001">0.001</option>
                    <option value="0.01">0.01</option>
                    <option value="0.05">0.05</option>
                    <option value="0.1">0.1</option>
                  </select>
                </div>

                <div className="form-group-training">
                  <label htmlFor="batchsize">Batch Size</label>
                  <input
                    type="number"
                    id="batchsize"
                    name="batchsize"
                    defaultValue={32}
                    min={16}
                    max={512}
                    step={16}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="training-actions">
              <button type="reset" className="btn btn-secondary">
                Reset
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-large"
                disabled={neurons === 0}
              >
                Train Network
              </button>
            </div>
          </form>
        </div>
        <div
          className="training-card"
          style={{ marginTop: "2rem", textAlign: "center" }}
        >
          <Link to="/prognosis" className="btn btn-primary">
            Go to Prognosis
          </Link>
        </div>

        <div className="training-card" style={{ marginTop: "2rem" }}>
          <h3 className="form-section-title">
            <i className="fas fa-history"></i> Training History
          </h3>

          <div style={{ maxHeight: "220px", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Algorithm</th>
                  <th>Status</th>
                  <th>Accuracy</th>
                </tr>
              </thead>

              <tbody>
                {history.map((item) => (
                  <tr key={item._id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: "10px" }}>{item.algorithm}</td>
                    <td style={{ padding: "10px" }}>{item.status}</td>
                    <td style={{ padding: "10px" }}>
                      {item.accuracy !== undefined
                        ? `${item.accuracy}%`
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
};

export default Training;
