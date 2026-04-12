import Dataset from "../models/dataset.model.js";
import axios from "axios";

/* ======================================
   RUN MECHANICAL ANALYSIS
====================================== */
export const runMechanicalAnalysis = async (req, res) => {
  try {
    const { datasetId, inputColumns, targetColumns } = req.body;

    if (!datasetId) {
      return res.status(400).json({
        message: "Dataset ID is required",
      });
    }

    const dataset = await Dataset.findById(datasetId);

    if (!dataset) {
      return res.status(404).json({
        message: "Dataset not found",
      });
    }

    const ML_BASE_URL = process.env.ML_SERVICE_URL;

    if (!ML_BASE_URL) {
      return res.status(500).json({
        message: "ML service URL not configured in .env",
      });
    }

    const response = await axios.post(
      `${ML_BASE_URL}/mechanical`,
      {
        file_path: dataset.filePath,
        input_columns: inputColumns || [],
        target_columns: targetColumns || [],
      },
      {
        timeout: 300000,
        headers: { "Content-Type": "application/json" },
      },
    );

    const pythonResult = response.data;

    return res.json({
      message: "Mechanical analysis completed",
      dataset: {
        id: dataset._id,
        fileName: dataset.fileName,
        rows: dataset.rowCount,
      },
      results: pythonResult.mechanical_results,
      criticalParameters: pythonResult.critical_parameters,
      severityMatrix: pythonResult.parameter_severity_matrix,
      dashboard: pythonResult.dashboard_data,
    });
  } catch (error) {
    console.error("Mechanical Analysis Error:", error);

    return res.status(500).json({
      message: "Mechanical analysis failed",
      error: error.response?.data || error.message,
    });
  }
};