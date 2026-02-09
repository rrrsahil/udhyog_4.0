import Prognosis from "../models/prognosis.model.js";
import Training from "../models/training.model.js";

/* PREDICT QUALITY */
export const predictQuality = async (req, res) => {
  try {
    const { inputs } = req.body;

    /* GET LATEST COMPLETED MODEL */
    const model = await Training.findOne({ status: "completed" })
      .sort({ createdAt: -1 });

    if (!model) {
      return res.status(400).json({
        message: "No trained model available"
      });
    }

    /* SIMULATED PREDICTION */
    const prediction = Number((70 + Math.random() * 30).toFixed(2));

    /* NEW — simulated confidence */
    const confidence = Number((85 + Math.random() * 15).toFixed(2));

    /* SAVE RESULT */
    const result = await Prognosis.create({
      inputs,
      prediction,
      confidence,
      modelUsed: model.algorithm
    });

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* GET RECENT PREDICTIONS */
export const getPrognosisHistory = async (req, res) => {
  try {
    const history = await Prognosis.find()
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
