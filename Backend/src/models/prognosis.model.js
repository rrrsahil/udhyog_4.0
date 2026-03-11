import mongoose from "mongoose";

const prognosisSchema = new mongoose.Schema(
  {
    inputs: {
      type: Object,
      required: true,
    },

    prediction_results: {
      type: Object,
      required: true,
    },

    modelUsed: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Prognosis", prognosisSchema);
