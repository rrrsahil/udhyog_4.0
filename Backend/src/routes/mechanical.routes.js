import express from "express";
import { runMechanicalAnalysis } from "../controllers/mechanical.controller.js";

const router = express.Router();

/* ======================================
   RUN MECHANICAL ANALYSIS
====================================== */
router.post("/run", runMechanicalAnalysis);

export default router;
