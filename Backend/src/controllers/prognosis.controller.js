import Prognosis from "../models/prognosis.model.js";
import Training from "../models/training.model.js";
import axios from "axios";

/* ======================================
   REAL PREDICT QUALITY
====================================== */
export const predictQuality = async (req, res) => {
  try {
    const { inputs } = req.body;

    if (!inputs || typeof inputs !== "object") {
      return res.status(400).json({
        message: "Valid input data required",
      });
    }

    const latestModel = await Training.findOne({ status: "completed" })
      .populate("dataset")
      .sort({ createdAt: -1 });

    if (!latestModel) {
      return res.status(400).json({
        message: "No trained model available",
      });
    }

    const response = await axios.post(
      "http://127.0.0.1:8001/predict",
      { sample: inputs },
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

    const savedResult = await Prognosis.create({
      inputs,
      prediction_results: pythonResult.prediction_results,
      modelUsed: latestModel.algorithm,
    });

    return res.json(savedResult);
  } catch (error) {
    console.error("Prediction Error:", error.message);

    return res.status(500).json({
      message: "Prediction failed",
      error: error.message,
    });
  }
};

/* ======================================
   GET RECENT PREDICTIONS
====================================== */
export const getPrognosisHistory = async (req, res) => {
  try {
    const history = await Prognosis.find().sort({ createdAt: -1 }).limit(20);

    return res.json(history);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* ======================================
   COUNT PREDICTIONS
====================================== */
export const countPredictions = async (req, res) => {
  try {
    const count = await Prognosis.countDocuments();
    return res.json({ count });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
