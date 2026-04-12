import Prognosis from "../models/prognosis.model.js";
import Training from "../models/training.model.js";
import axios from "axios";

/* ======================================
   PREDICT DEFECT (QUALITY PROGNOSIS)
====================================== */
export const predictQuality = async (req, res) => {
  try {
    const { inputs } = req.body;

    // ================= VALIDATION =================
    if (!inputs || typeof inputs !== "object") {
      return res.status(400).json({
        message: "Valid input data required",
      });
    }

    // ================= FETCH LATEST TRAINED MODEL =================
    const latestModel = await Training.findOne({ status: "completed" })
      .populate("dataset")
      .sort({ createdAt: -1 });

    if (!latestModel) {
      return res.status(400).json({
        message: "No trained model available",
      });
    }

    // ================= ML SERVICE CONFIG =================
    const ML_BASE_URL = process.env.ML_SERVICE_URL;

    if (!ML_BASE_URL) {
      return res.status(500).json({
        message: "ML service URL not configured in .env",
      });
    }

    // ================= CALL ML SERVICE =================
    const mlResponse = await axios.post(
      `${ML_BASE_URL}/predict`,
      {
        sample: inputs,
      },
      {
        timeout: 30000,
        headers: { "Content-Type": "application/json" },
      },
    );

    const pythonResult = mlResponse.data;

    // ================= VALIDATE ML RESPONSE =================
    if (!pythonResult || !pythonResult.prediction_results) {
      return res.status(500).json({
        message: "Invalid response from ML service",
      });
    }

    // ================= SAVE RESULT =================
    const savedResult = await Prognosis.create({
      inputs,
      prediction_results: pythonResult.prediction_results,

      // MODEL DETAILS
      modelUsed: latestModel.algorithm,
      inputColumns: latestModel.inputColumns || [],
      targetColumns: latestModel.targetColumns || [],

      // 🔥 IMPORTANT FOR UI
      type: "defect",

      // OPTIONAL FUTURE DATA
      metadata: {
        datasetId: latestModel.dataset?._id || null,
        trainedAt: latestModel.updatedAt || null,
      },
    });

    // ================= RESPONSE =================
    return res.status(200).json({
      success: true,
      message: "Prediction successful",
      result: savedResult,
    });
  } catch (error) {
    console.error("Prediction Error:", error);

    return res.status(500).json({
      success: false,
      message: "Prediction failed",
      error: error.response?.data || error.message,
    });
  }
};

/* ======================================
   GET RECENT PREDICTIONS
====================================== */
export const getPrognosisHistory = async (req, res) => {
  try {
    const history = await Prognosis.find().sort({ createdAt: -1 }).limit(20);

    return res.status(200).json(history);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

/* ======================================
   GET SINGLE PREDICTION (DETAIL VIEW)
====================================== */
export const getSinglePrediction = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Prognosis.findById(id);

    if (!result) {
      return res.status(404).json({
        message: "Prediction not found",
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

/* ======================================
   COUNT TOTAL PREDICTIONS
====================================== */
export const countPredictions = async (req, res) => {
  try {
    const count = await Prognosis.countDocuments();

    return res.status(200).json({ count });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
