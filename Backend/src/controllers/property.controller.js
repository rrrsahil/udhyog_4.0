import Dataset from "../models/dataset.model.js";
import axios from "axios";

/* ======================================
   TRAIN PROPERTY MODEL
====================================== */
export const trainPropertyModel = async (req, res) => {
  try {
    const { datasetId, inputColumns, targetColumns } = req.body;

    if (!datasetId || !inputColumns || !targetColumns) {
      return res.status(400).json({
        message: "datasetId, inputColumns and targetColumns are required",
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
        message: "ML service URL not configured",
      });
    }

    const response = await axios.post(
      `${ML_BASE_URL}/property/train`,
      {
        file_path: dataset.filePath,
        input_columns: inputColumns,
        target_columns: targetColumns,
      },
      {
        timeout: 300000,
        headers: { "Content-Type": "application/json" },
      },
    );

    const pythonResult = response.data;

    return res.json({
      message: "Property model trained successfully",
      dataset: {
        id: dataset._id,
        fileName: dataset.fileName,
      },
      metrics: {
        mse: pythonResult.mse,
        r2_score: pythonResult.r2_score,
      },
      inputsUsed: pythonResult.inputs_used,
      targetsPredicted: pythonResult.targets_predicted,
    });
  } catch (error) {
    console.error("Property Training Error:", error);

    return res.status(500).json({
      message: "Property model training failed",
      error: error.response?.data || error.message,
    });
  }
};

/* ======================================
   PREDICT PROPERTIES
====================================== */
export const predictProperty = async (req, res) => {
  try {
    const { inputs } = req.body;

    if (!inputs || typeof inputs !== "object") {
      return res.status(400).json({
        message: "Valid input data required",
      });
    }

    const ML_BASE_URL = process.env.ML_SERVICE_URL;

    if (!ML_BASE_URL) {
      return res.status(500).json({
        message: "ML service URL not configured",
      });
    }

    const response = await axios.post(
      `${ML_BASE_URL}/property/predict`,
      {
        sample: inputs,
      },
      {
        timeout: 30000,
        headers: { "Content-Type": "application/json" },
      },
    );

    const pythonResult = response.data;

    if (!pythonResult.prediction_results) {
      return res.status(500).json({
        message: "Invalid response from ML service",
      });
    }

    return res.json({
      message: "Property prediction successful",
      predictions: pythonResult.prediction_results,
    });
  } catch (error) {
    console.error("Property Prediction Error:", error);

    return res.status(500).json({
      message: "Property prediction failed",
      error: error.response?.data || error.message,
    });
  }
};
