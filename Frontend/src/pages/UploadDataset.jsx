import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import { toast } from "react-toastify";

const UploadDataset = () => {
  const [fileName, setFileName] = useState("No file selected");
  const [columns, setColumns] = useState([]);
  const [filePath, setFilePath] = useState("");
  const [showParameters, setShowParameters] = useState(false);
  const [latestDataset, setLatestDataset] = useState(null); // NEW

  /* LOAD LATEST DATASET INFO */
  const loadLatestDataset = async () => {
    try {
      const res = await API.get("/dataset/latest");
      setLatestDataset(res.data);
    } catch (err) {}
  };

  useEffect(() => {
    loadLatestDataset();
  }, []);

  /* Upload & Preview */
  const handleFileChange = async (e) => {
    if (!e.target.files.length) return;

    const file = e.target.files[0];
    setFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await API.post("/dataset/preview", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setColumns(res.data.columns);
      setFilePath(res.data.filePath);
      setShowParameters(true);

      toast.success("Dataset preview loaded");

    } catch (error) {
      toast.error("Upload failed");
    }
  };

  /* Save Dataset */
  const handleSaveDataset = async () => {
    try {
      await API.post("/dataset/save", {
        fileName,
        filePath,
        columns
      });

      toast.success("Dataset saved successfully");
      loadLatestDataset(); // refresh latest info

    } catch (error) {
      toast.error("Save failed");
    }
  };

  return (
    <>
      <main className="dashboard-container">
        <div className="page-header">
          <h1 className="page-title">
            <i className="fas fa-cloud-upload-alt"></i> Upload Dataset
          </h1>
          <p className="page-subtitle">
            Import your Excel file to extract parameters automatically
          </p>
        </div>

        <div className="recent-section">
          <div className="upload-section">
            <div className="upload-icon">
              <i className="fas fa-cloud-upload-alt"></i>
            </div>

            <h3 className="upload-title">Upload Excel File</h3>

            <p className="upload-subtitle">
              Drag and drop your file here or click to browse
            </p>

            <div className="file-input-wrapper">
              <input
                type="file"
                id="fileInput"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
              />
              <label htmlFor="fileInput" className="file-input-label">
                <i className="fas fa-folder-open"></i> Choose File
              </label>
            </div>

            <p className="file-name">{fileName}</p>
          </div>

          {showParameters && (
            <div style={{ marginTop: "2rem" }}>

              {/* LATEST DATASET INFO */}
              {latestDataset && (
                <div
                  style={{
                    background: "#eef3ff",
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                    fontSize: "14px"
                  }}
                >
                  <b>Last Uploaded Dataset:</b> {latestDataset.fileName} <br />
                  <b>Uploaded On:</b>{" "}
                  {new Date(latestDataset.createdAt).toLocaleString()}
                </div>
              )}

              <div className="section-header">
                <h2 className="section-title">
                  <i className="fas fa-list-check"></i> Detected Parameters
                </h2>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Parameter Name</th>
                    <th>Type</th>
                    <th>Data Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {columns.map((col, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{col}</td>
                      <td>Input</td>
                      <td>Numeric</td>
                      <td>✓ Valid</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <button className="btn btn-primary" onClick={handleSaveDataset}>
                  Save Dataset
                </button>

                <Link
                  to="/training"
                  className="btn btn-secondary"
                  style={{ marginLeft: "15px" }}
                >
                  Proceed to Training
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default UploadDataset;
