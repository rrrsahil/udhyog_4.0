import Training from "../models/training.model.js";
import Dataset from "../models/dataset.model.js";
import axios from "axios";

/* ======================================
   START TRAINING
====================================== */
export const startTraining = async (req, res) => {
  let training;

  try {
    const {
      algorithm,
      datasetId,
      neurons,
      layers,
      transfer,
      epochs,
      learningrate,
      batchsize,
      inputColumns, // ✅ NEW
      targetColumns, // ✅ NEW
    } = req.body;

    if (!datasetId) {
      return res.status(400).json({ message: "Dataset ID required" });
    }

    const datasetRecord = await Dataset.findById(datasetId);

    if (!datasetRecord) {
      return res.status(404).json({ message: "Dataset not found" });
    }

    training = await Training.create({
      algorithm,
      dataset: datasetId,
      neurons,
      layers,
      transfer,
      epochs,
      learningrate,
      status: "running",
      progress: 0,
      inputColumns,
      targetColumns,
    });

    const pythonPayload = {
      file_path: datasetRecord.filePath,
      neurons,
      hidden_layers: layers,
      activation: transfer,
      epochs,
      learning_rate: learningrate,
      algorithm,
      batch_size: batchsize,
      training_id: training._id.toString(),
      input_columns: inputColumns,
      target_columns: targetColumns,
    };

    const ML_BASE_URL = process.env.ML_SERVICE_URL;

    if (!ML_BASE_URL) {
      return res.status(500).json({
        message: "ML service URL not configured in .env",
      });
    }

    const response = await axios.post(`${ML_BASE_URL}/train`, pythonPayload, {
      timeout: 600000,
      headers: { "Content-Type": "application/json" },
    });

    const result = response.data;

    await Training.findByIdAndUpdate(training._id, {
      status: "completed",
      progress: 100,
      accuracy: result.accuracy,
      cross_val_accuracy: result.cross_val_accuracy,
      precision: result.precision,
      recall: result.recall,
      f1_score: result.f1_score,
      confusion_matrix: result.confusion_matrix,
      targets: result.targets,
      inputColumns,
      targetColumns,
    });

    return res.json({
      message: "Training completed successfully",
      result,
      trainingId: training._id,
    });
  } catch (error) {
    if (training) {
      await Training.findByIdAndUpdate(training._id, {
        status: "failed",
        progress: 0,
      });
    }

    return res.status(500).json({
      message: "Training failed",
      error: error.message,
    });
  }
};

/* ======================================
   GET TRAINING STATUS
====================================== */
export const getTrainingStatus = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id).populate("dataset");
    res.json(training);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================================
   TRAINING HISTORY
====================================== */
export const getTrainingHistory = async (req, res) => {
  try {
    const history = await Training.find()
      .populate("dataset")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================================
   GET LATEST TRAINED MODEL
====================================== */
export const getLatestTraining = async (req, res) => {
  try {
    const latest = await Training.findOne({ status: "completed" })
      .populate("dataset")
      .sort({ createdAt: -1 });

    if (!latest) {
      return res.json(null);
    }

    res.json(latest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================================
   COUNT TRAININGS
====================================== */
export const countTrainings = async (req, res) => {
  try {
    const count = await Training.countDocuments({ status: "completed" });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================================
   PROGRESS BAR
====================================== */
export const updateProgress = async (req, res) => {
  try {
    await Training.findByIdAndUpdate(req.params.id, {
      progress: req.body.progress,
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
