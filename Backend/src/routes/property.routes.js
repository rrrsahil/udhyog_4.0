import express from "express";
import {
  trainPropertyModel,
  predictProperty,
} from "../controllers/property.controller.js";

const router = express.Router();

router.post("/train", trainPropertyModel);
router.post("/predict", predictProperty);

export default router;
