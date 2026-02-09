import express from "express";
import { predictQuality, getPrognosisHistory } from "../controllers/prognosis.controller.js";

const router = express.Router();

router.post("/predict", predictQuality);
router.get("/history", getPrognosisHistory);

export default router;