import mongoose from "mongoose";

const datasetSchema = new mongoose.Schema(
  {
    fileName: String,
    filePath: String,
    columns: [String]
  },
  { timestamps: true }
);

export default mongoose.model("Dataset", datasetSchema);
