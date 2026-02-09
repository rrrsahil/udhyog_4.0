import Training from "../models/training.model.js";

/* START TRAINING */
export const startTraining = async (req, res) => {
  try {
    const training = await Training.create({
      ...req.body,
      status: "running",
      accuracy: 0,
      progress: 0
    });

    let progress = 0;

    /* SIMULATED TRAINING PROCESS */
    const interval = setInterval(async () => {
      try {
        progress += 5;

        if (progress >= 100) {
          progress = 100;

          await Training.findByIdAndUpdate(training._id, {
            progress: 100,
            status: "completed",
            accuracy: Number((80 + Math.random() * 20).toFixed(2))
          });

          clearInterval(interval);
        } else {
          await Training.findByIdAndUpdate(training._id, {
            progress: progress
          });
        }
      } catch (err) {
        clearInterval(interval);
      }
    }, 1000);

    res.json({
      message: "Training started",
      training
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* GET TRAINING STATUS */
export const getTrainingStatus = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    res.json(training);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* TRAINING HISTORY */
export const getTrainingHistory = async (req, res) => {
  try {
    const history = await Training.find()
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* GET LATEST TRAINED MODEL */
export const getLatestTraining = async (req, res) => {
  try {
    const latest = await Training.findOne({ status: "completed" })
      .sort({ createdAt: -1 });

    if (!latest) {
      return res.json(null);   // <-- important
    }

    res.json(latest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


