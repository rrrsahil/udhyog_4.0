import mongoose from "mongoose";

const prognosisSchema = new mongoose.Schema(
  {
    inputs: Object,
    prediction: Number,
    confidence: Number,
    modelUsed: String
  },
  { timestamps: true }
);

export default mongoose.model("Prognosis", prognosisSchema);
