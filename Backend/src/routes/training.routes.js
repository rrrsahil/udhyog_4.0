import express from "express";
import {
  startTraining,
  getTrainingStatus,
  getTrainingHistory,
  getLatestTraining,
  countTrainings
} from "../controllers/training.controller.js";

const router = express.Router();

router.get("/latest", getLatestTraining);
router.get("/history/all", getTrainingHistory);
router.get("/count", countTrainings);
router.get("/:id", getTrainingStatus);
router.post("/start", startTraining);

export default router;
