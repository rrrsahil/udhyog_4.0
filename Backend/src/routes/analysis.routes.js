import express from "express";
import { runDiagnosis } from "../controllers/analysis.controller.js";

const router = express.Router();

router.post("/run", runDiagnosis);

export default router;
