import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import datasetRoutes from "./routes/dataset.routes.js";
import trainingRoutes from "./routes/training.routes.js";
import prognosisRoutes from "./routes/prognosis.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/dataset", datasetRoutes);
app.use("/api/training", trainingRoutes);
app.use("/api/prognosis", prognosisRoutes);

app.get("/", (req, res) => {
  res.send("QPS Backend Running...");
});

export default app;
