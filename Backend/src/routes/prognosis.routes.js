import express from "express";
import { predictQuality, getPrognosisHistory, countPredictions } from "../controllers/prognosis.controller.js";

const router = express.Router();

router.post("/predict", predictQuality);
router.get("/history", getPrognosisHistory);
router.get("/count", countPredictions);

export default router;