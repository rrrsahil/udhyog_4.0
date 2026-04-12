import Dataset from "../models/dataset.model.js";
import axios from "axios";

/* ======================================
   RUN DIAGNOSIS ANALYSIS
====================================== */
export const runDiagnosis = async (req, res) => {
  try {
    const { datasetId, inputColumns, targetColumns } = req.body;

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

    const ML_BASE_URL = process.env.ML_SERVICE_URL;

    const response = await axios.post(
      `${ML_BASE_URL}/diagnosis`,
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
      message: "Diagnosis analysis completed",

      dataset: {
        id: dataset._id,
        fileName: dataset.fileName,
        rows: dataset.rowCount,
      },

      summary: pythonResult.dataset_summary,
      results: pythonResult.diagnosis_results,
      criticalParameters: pythonResult.critical_parameters,
      severityMatrix: pythonResult.severity_matrix,
      dashboard: pythonResult.dashboard_data,
    });
  } catch (error) {
    console.error("Diagnosis Error:", error);

    return res.status(500).json({
      message: "Diagnosis failed",
      error: error.response?.data || error.message,
    });
  }
};
