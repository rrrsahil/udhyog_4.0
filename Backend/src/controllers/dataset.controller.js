import fs from "fs";
import csv from "csv-parser";
import Dataset from "../models/dataset.model.js";

/* PREVIEW CSV */
export const previewDataset = async (req, res) => {
  try {
    const filePath = req.file.path;
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        if (results.length < 5) results.push(data);
      })
      .on("end", () => {
        const columns = Object.keys(results[0] || {});
        res.json({
          filePath,
          columns,
          preview: results
        });
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* SAVE DATASET */
export const saveDataset = async (req, res) => {
  try {
    const { fileName, filePath, columns } = req.body;

    const dataset = await Dataset.create({
      fileName,
      filePath,
      columns
    });

    res.json({ message: "Dataset saved", dataset });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* GET ALL DATASETS */
export const getAllDatasets = async (req, res) => {
  const datasets = await Dataset.find().sort({ createdAt: -1 });
  res.json(datasets);
};

/* GET SINGLE DATASET */
export const getDatasetById = async (req, res) => {
  const dataset = await Dataset.findById(req.params.id);
  res.json(dataset);
};

/* GET LATEST DATASET */
export const getLatestDataset = async (req, res) => {
  try {
    const dataset = await Dataset.findOne().sort({ createdAt: -1 });
    res.json(dataset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* COUNT DATASETS */
export const countDatasets = async (req, res) => {
  try {
    const count = await Dataset.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
