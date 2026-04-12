import mongoose from "mongoose";

const trainingSchema = new mongoose.Schema(
  {
    algorithm: { type: String, required: true },

    dataset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dataset",
      required: true,
    },

    neurons: { type: Number, required: true },
    layers: { type: Number, required: true },
    transfer: { type: String, required: true },
    epochs: { type: Number, required: true },
    learningrate: { type: Number, required: true },
    status: {
      type: String,
      enum: ["running", "completed", "failed"],
      default: "running",
    },
    progress: { type: Number, default: 0 },
    inputColumns: {
      type: [String],
      default: [],
    },
    targetColumns: {
      type: [String],
      default: [],
    },
    accuracy: Number,
    targets: [String],
    weights_bias: mongoose.Schema.Types.Mixed,
    combination_ranges: mongoose.Schema.Types.Mixed,
    cross_val_accuracy: Number,
    precision: Number,
    recall: Number,
    f1_score: Number,
    confusion_matrix: mongoose.Schema.Types.Mixed,
    defect_probability: Number,
    multi_class: Boolean,
  },
  { timestamps: true },
);

export default mongoose.model("Training", trainingSchema);
