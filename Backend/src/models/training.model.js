import mongoose from "mongoose";

const trainingSchema = new mongoose.Schema(
  {
    /* ANN CONFIG */
    algorithm: String,
    dataset: String,
    neurons: Number,
    layers: Number,
    transfer: String,
    epochs: Number,
    learningrate: Number,
    batchsize: Number,

    /* NEW ANN FIELD */
    errorGoal: { type: String, default: "1e-5" },

    /* TRAINING STATUS */
    status: { type: String, default: "running" },
    progress: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("Training", trainingSchema);
