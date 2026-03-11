import mongoose from "mongoose";

const datasetSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    datasetType: {
      type: String,
      enum: ["csv", "excel"],
      required: true,
    },

    columns: {
      type: [String],
      required: true,
    },

    numericColumns: {
      type: [String],
      default: [],
    },

    targetColumns: {
      type: [String],
      default: [],
    },

    rowCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Dataset", datasetSchema);
