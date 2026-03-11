import Dataset from "../models/dataset.model.js";
import axios from "axios";

/* ======================================
   RUN DIAGNOSIS ANALYSIS
====================================== */
export const runDiagnosis = async (req, res) => {
  try {
    const { datasetId } = req.body;

    if (!datasetId) {
      return res.status(400).json({
        message: "Dataset ID required",
      });
    }

    const dataset = await Dataset.findById(datasetId);

    if (!dataset) {
      return res.status(404).json({
        message: "Dataset not found",
      });
    }

    const response = await axios.post(
      "http://127.0.0.1:8001/diagnosis",
      {
        file_path: dataset.filePath,
      },
      {
        timeout: 300000,
        headers: { "Content-Type": "application/json" },
      },
    );

    const pythonResult = response.data;

    if (!pythonResult) {
      return res.status(500).json({
        message: "Invalid response from ML service",
      });
    }

    return res.json({
      message: "Diagnosis analysis completed",
      result: pythonResult,
    });
  } catch (error) {
    console.error("Diagnosis Error:", error.message);

    return res.status(500).json({
      message: "Diagnosis failed",
      error: error.message,
    });
  }
};
