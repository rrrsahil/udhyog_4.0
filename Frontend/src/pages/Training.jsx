import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import { toast } from "react-toastify";

const Training = () => {
  const navigate = useNavigate();

  /* STATES */
  const [datasets, setDatasets] = useState([]);
  const [history, setHistory] = useState([]);
  const [trainingStatus, setTrainingStatus] = useState("");
  const [trainingAccuracy, setTrainingAccuracy] = useState("");
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [neurons, setNeurons] = useState(64);

  /* LOAD DATASETS */
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const res = await API.get("/dataset");
        setDatasets(res.data);
      } catch (error) {
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
    } catch (err) {}
  };

  useEffect(() => {
    loadHistory();
  }, []);

  /* AUTO REFRESH HISTORY EVERY 5s  -------- FIX 1 */
  useEffect(() => {
    const interval = setInterval(() => {
      loadHistory();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  /* CHECK TRAINING STATUS (AUTO AFTER REFRESH ALSO) */
  useEffect(() => {
    const id = localStorage.getItem("trainingId");
    if (!id) return;

    const interval = setInterval(async () => {
      try {
        const res = await API.get(`/training/${id}`);

        setTrainingStatus(res.data.status || "");
        setTrainingAccuracy(res.data.accuracy || "");
        setTrainingProgress(res.data.progress || 0);

        if (res.data.status === "completed") {
          clearInterval(interval);
          loadHistory();
        }
      } catch (error) {}
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    const data = {
      algorithm: form.algorithm.value,
      dataset: form.dataset.value,
      neurons: Number(neurons),
      layers: Number(form.layers.value),
      transfer: form.transfer.value,
      epochs: Number(form.epochs.value),
      learningrate: Number(form.learningrate.value),
      batchsize: Number(form.batchsize.value),
    };

    try {
      const res = await API.post("/training/start", data);

      localStorage.setItem("trainingId", res.data.training._id);

      setTrainingStatus("running");
      setTrainingAccuracy("");
      setTrainingProgress(0);

      toast.success("Training started successfully");
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
              {trainingAccuracy ? <> | Accuracy: <b>{trainingAccuracy}%</b></>: null}
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

          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3 className="form-section-title">
                <i className="fas fa-cog" /> Algorithm Settings
              </h3>

              <div className="form-group-training">
                <label htmlFor="algorithm">Training Algorithm</label>
                <select id="algorithm" name="algorithm" required>
                  <option value="">Select an algorithm</option>
                  <option value="backpropagation">Backpropagation</option>
                  <option value="gradient-descent">Gradient Descent</option>
                  <option value="momentum">Momentum</option>
                  <option value="adam-optimizer">Adam Optimizer</option>
                  <option value="rmsprop">RMSprop</option>
                </select>
              </div>

              <div className="form-group-training">
                <label htmlFor="dataset">Select Dataset</label>
                <select
                  id="dataset"
                  name="dataset"
                  required
                  onChange={(e) => {
                    const id = e.target.value;
                    const selected = datasets.find((d) => d._id === id);
                    if (selected) setNeurons(selected.columns.length);
                    }}
                >
                  <option value="">Choose a dataset</option>
                  {datasets.map((ds) => (
                    <option key={ds._id} value={ds._id}>
                      {ds.fileName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">
                <i className="fas fa-project-diagram" /> Network Architecture
              </h3>

              <div className="form-row-two-col">
                <div className="form-group-training">
                  <label htmlFor="neurons">Number of Neurons</label>
                  <input
                    type="number"
                    id="neurons"
                    name="neurons"
                    value={neurons}
                    onChange={(e) => setNeurons(e.target.value)}
                    min={1}
                    max={512}
                    step={1}
                    required
                  />
                </div>

                <div className="form-group-training">
                  <label htmlFor="layers">Number of Hidden Layers</label>
                  <input
                    type="number"
                    id="layers"
                    name="layers"
                    defaultValue={2}
                    min={1}
                    max={10}
                    required
                  />
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
                    defaultValue={100}
                    min={10}
                    max={1000}
                    required
                  />
                </div>
              </div>

              <div className="form-row-two-col">
                <div className="form-group-training">
                  <label htmlFor="learningrate">Learning Rate</label>
                  <input
                    type="number"
                    id="learningrate"
                    name="learningrate"
                    defaultValue={0.01}
                    step="0.001"
                    required
                  />
                </div>

                <div className="form-group-training">
                  <label htmlFor="batchsize">Batch Size</label>
                  <input
                    type="number"
                    id="batchsize"
                    name="batchsize"
                    defaultValue={32}
                    min={8}
                    max={256}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="training-actions">
              <button type="reset" className="btn btn-secondary">Reset</button>
              <button type="submit" className="btn btn-primary btn-large">Train Network</button>
            </div>
          </form>
        </div>
         <div className="training-card" style={{ marginTop: "2rem", textAlign: "center" }}>
          <Link to="/prognosis" className="btn btn-primary">Go to Prognosis</Link>
        </div>

        <div className="training-card" style={{ marginTop: "2rem" }}>
          <h3 className="form-section-title">
            <i className="fas fa-history"></i> Training History
          </h3>

          <div style={{ maxHeight: "220px", overflowY: "auto" }}>
            {history.map((item) => (
              <div
                key={item._id}
                style={{
                  padding: "10px",
                  borderBottom: "1px solid #ddd",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>{item.algorithm}</span>
                <span>{item.status}</span>
                <span>{item.accuracy}%</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Training;
