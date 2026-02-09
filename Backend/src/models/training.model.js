import mongoose from "mongoose";

const trainingSchema = new mongoose.Schema(
  {
    algorithm: String,
    dataset: String,
    neurons: Number,
    layers: Number,
    transfer: String,
    epochs: Number,
    learningrate: Number,
    batchsize: Number,

    status: { type: String, default: "running" },
    progress: { type: Number, default: 0 }, 
    accuracy: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("Training", trainingSchema);
