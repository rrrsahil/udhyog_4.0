import express from "express";
import {
  startTraining,
  getTrainingStatus,
  getTrainingHistory,
  getLatestTraining,
  countTrainings,
  updateProgress,
} from "../controllers/training.controller.js";

const router = express.Router();

router.post("/start", startTraining);
router.put("/progress/:id", updateProgress);
router.get("/latest", getLatestTraining);
router.get("/history/all", getTrainingHistory);
router.get("/count", countTrainings);
router.get("/:id", getTrainingStatus);

export default router;
