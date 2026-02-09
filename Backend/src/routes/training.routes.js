import express from "express";
import {
  startTraining,
  getTrainingStatus,
  getTrainingHistory,
  getLatestTraining
} from "../controllers/training.controller.js";

const router = express.Router();

/* IMPORTANT — specific routes FIRST */
router.get("/latest", getLatestTraining);
router.get("/history/all", getTrainingHistory);

/* dynamic route always LAST */
router.get("/:id", getTrainingStatus);

router.post("/start", startTraining);

export default router;
