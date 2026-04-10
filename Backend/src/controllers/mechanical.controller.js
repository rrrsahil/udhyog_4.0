import Dataset from "../models/dataset.model.js";
import axios from "axios";

/* ======================================
   RUN MECHANICAL ANALYSIS
====================================== */
export const runMechanicalAnalysis = async (req, res) => {
  try {
    const { datasetId } = req.body;

    /* ===============================
       VALIDATION
    =============================== */
    if (!datasetId) {
      return res.status(400).json({
        message: "Dataset ID is required",
      });
    }

    /* ===============================
       FIND DATASET
    =============================== */
    const dataset = await Dataset.findById(datasetId);

    if (!dataset) {
      return res.status(404).json({
        message: "Dataset not found",
      });
    }

    /* ===============================
       CALL PYTHON ML SERVICE
    =============================== */
    const response = await axios.post(
      "http://127.0.0.1:8001/mechanical",
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
        message: "Invalid response from ML Service",
      });
    }

    /* ===============================
       RESPONSE STRUCTURE
    =============================== */

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
    error: error.response?.data || error.message
  });

}
};
