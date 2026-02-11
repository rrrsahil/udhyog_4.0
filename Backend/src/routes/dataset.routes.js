import express from "express";
import upload from "../configs/multer.js";
import {
  previewDataset,
  saveDataset,
  getAllDatasets,
  getDatasetById,
  getLatestDataset,
  countDatasets
} from "../controllers/dataset.controller.js";

const router = express.Router();

router.post("/preview", upload.single("file"), previewDataset);
router.post("/save", saveDataset);
router.get("/", getAllDatasets);
router.get("/latest", getLatestDataset);
router.get("/count", countDatasets);
router.get("/:id", getDatasetById);

export default router;
