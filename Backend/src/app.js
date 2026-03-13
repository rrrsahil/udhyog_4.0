import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import datasetRoutes from "./routes/dataset.routes.js";
import trainingRoutes from "./routes/training.routes.js";
import prognosisRoutes from "./routes/prognosis.routes.js";
import analysisRoutes from "./routes/analysis.routes.js";
import mechanicalRoutes from "./routes/mechanical.routes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/dataset", datasetRoutes);
app.use("/api/training", trainingRoutes);
app.use("/api/prognosis", prognosisRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/mechanical", mechanicalRoutes);

app.get("/", (req, res) => {
  res.send("QPS Backend Running...");
});

export default app;
