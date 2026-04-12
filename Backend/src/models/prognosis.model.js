import mongoose from "mongoose";

const prognosisSchema = new mongoose.Schema(
  {
    /* ================= INPUT PARAMETERS ================= */
    inputs: {
      type: Object,
      required: true,
    },

    /* ================= PREDICTION RESULTS ================= */
    prediction_results: {
      type: Object,
      required: true,
    },

    /* ================= MODEL INFO ================= */
    modelUsed: {
      type: String,
      required: true,
      trim: true,
    },

    /* ================= TYPE (VERY IMPORTANT) =================
       Helps distinguish:
       - defect → probability-based output
       - property → regression output
    */
    type: {
      type: String,
      enum: ["defect", "property"],
      default: "defect",
    },

    /* ================= OPTIONAL (FOR TRACEABILITY) ================= */
    inputColumns: {
      type: [String],
      default: [],
    },

    targetColumns: {
      type: [String],
      default: [],
    },

    /* ================= FUTURE READY (OPTIONAL) ================= */
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
);

export default mongoose.model("Prognosis", prognosisSchema);