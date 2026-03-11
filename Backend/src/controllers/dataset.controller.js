import fs from "fs";
import path from "path";
import csv from "csv-parser";
import xlsx from "xlsx";
import Dataset from "../models/dataset.model.js";

/* ===============================
   PREVIEW DATASET
=============================== */
export const previewDataset = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const absolutePath = path.resolve(req.file.path);
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    let columns = [];
    let previewData = [];
    let fullData = [];
    let datasetType = "";
    let numericColumns = [];
    let rowCount = 0;

    /* =========================
       HANDLE CSV FILE
    ========================== */
    if (fileExtension === ".csv") {
      datasetType = "csv";

      await new Promise((resolve, reject) => {
        fs.createReadStream(absolutePath)
          .pipe(csv())
          .on("data", (data) => {
            fullData.push(data);
            if (previewData.length < 5) previewData.push(data);
          })
          .on("end", resolve)
          .on("error", reject);
      });

      if (!fullData.length) {
        return res.status(400).json({ message: "CSV file is empty" });
      }

      columns = Object.keys(fullData[0]).map((col) =>
        col.replace(/^\uFEFF/, ""),
      );

      // =========================
      // CHECK HEAT COLUMN UNIQUENESS (SAFE VERSION)
      // =========================
      const heatColumn = columns[0];

      // Clean values (trim, remove null/blank)
      const heatValues = fullData
        .map((row) => String(row[heatColumn]).trim())
        .filter((val) => val !== "" && val !== "null" && val !== "undefined");

      // Check duplicates
      const uniqueHeatValues = new Set(heatValues);

      if (uniqueHeatValues.size !== heatValues.length) {
        return res.status(400).json({
          message:
            "Heat Number column must contain unique and non-empty values",
        });
      }

      rowCount = fullData.length;
      if (columns.length < 7) {
        return res.status(400).json({
          message:
            "Dataset must contain at least 7 columns (1 Heat + 5 Targets + Inputs)",
        });
      }
      // Ensure target columns (2–6) are numeric
      const targetColumns = columns.slice(1, 6);

      for (let target of targetColumns) {
        const nonNumeric = fullData.some((row) =>
          isNaN(parseFloat(row[target])),
        );

        if (nonNumeric) {
          return res.status(400).json({
            message: `Target column "${target}" must contain numeric values (0/1)`,
          });
        }
      }
    } else if (fileExtension === ".xlsx" || fileExtension === ".xls") {
      /* =========================
       HANDLE EXCEL FILE
    ========================== */
      datasetType = "excel";

      const workbook = xlsx.readFile(absolutePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      fullData = xlsx.utils.sheet_to_json(worksheet);

      if (!fullData.length) {
        return res.status(400).json({ message: "Excel file is empty" });
      }

      columns = Object.keys(fullData[0]).map((col) =>
        col.replace(/^\uFEFF/, ""),
      );

      // =========================
      // CHECK HEAT COLUMN UNIQUENESS (SAFE VERSION)
      // =========================
      const heatColumn = columns[0];

      // Clean values (trim, remove null/blank)
      const heatValues = fullData
        .map((row) => String(row[heatColumn]).trim())
        .filter((val) => val !== "" && val !== "null" && val !== "undefined");

      // Check duplicates
      const uniqueHeatValues = new Set(heatValues);

      if (uniqueHeatValues.size !== heatValues.length) {
        return res.status(400).json({
          message:
            "Heat Number column must contain unique and non-empty values",
        });
      }
      
      previewData = fullData.slice(0, 5);
      rowCount = fullData.length;
      if (columns.length < 7) {
        return res.status(400).json({
          message:
            "Dataset must contain at least 7 columns (1 Heat + 5 Targets + Inputs)",
        });
      }
      // Ensure target columns (2–6) are numeric
      const targetColumns = columns.slice(1, 6);

      for (let target of targetColumns) {
        const nonNumeric = fullData.some((row) =>
          isNaN(parseFloat(row[target])),
        );

        if (nonNumeric) {
          return res.status(400).json({
            message: `Target column "${target}" must contain numeric values (0/1)`,
          });
        }
      }
    } else {
      return res.status(400).json({ message: "Unsupported file type" });
    }

    /* =========================
       Detect Numeric Columns
    ========================== */
    numericColumns = columns.filter((col) => {
      let numericCount = 0;

      for (let row of fullData) {
        const value = row[col];

        if (value !== null && value !== "" && !isNaN(parseFloat(value))) {
          numericCount++;
        }
      }

      // If at least 70% values numeric → treat as numeric column
      return numericCount >= fullData.length * 0.7;
    });

    return res.json({
      fileName: req.file.originalname,
      filePath: absolutePath,
      datasetType,
      columns,
      numericColumns,
      rowCount,
      preview: previewData,

      heatColumn: columns[0],
      targetColumns: columns.slice(1, 6),
      inputColumns: columns.slice(6),
    });
  } catch (error) {
    console.error("Preview error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   SAVE DATASET
=============================== */
export const saveDataset = async (req, res) => {
  try {
    const {
      fileName,
      filePath,
      datasetType,
      columns,
      numericColumns,
      rowCount,
      targetColumns,
    } = req.body;
    if (!fileName || !filePath || !datasetType || !columns) {
      return res.status(400).json({
        message: "Missing required dataset information",
      });
    }

    const absolutePath = path.resolve(filePath);

    const dataset = await Dataset.create({
      fileName,
      filePath: absolutePath,
      datasetType,
      columns,
      numericColumns,
      rowCount,
      targetColumns,
    });

    res.json({
      message: "Dataset saved successfully",
      dataset,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   GET ALL DATASETS
=============================== */
export const getAllDatasets = async (req, res) => {
  try {
    const datasets = await Dataset.find().sort({ createdAt: -1 });
    res.json(datasets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   GET SINGLE DATASET
=============================== */
export const getDatasetById = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.id);

    if (!dataset) {
      return res.status(404).json({ message: "Dataset not found" });
    }

    res.json(dataset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   GET LATEST DATASET
=============================== */
export const getLatestDataset = async (req, res) => {
  try {
    const dataset = await Dataset.findOne().sort({ createdAt: -1 });
    res.json(dataset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   COUNT DATASETS
=============================== */
export const countDatasets = async (req, res) => {
  try {
    const count = await Dataset.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   DELETE DATASET
=============================== */
export const deleteDataset = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.id);

    if (!dataset) {
      return res.status(404).json({ message: "Dataset not found" });
    }

    if (fs.existsSync(dataset.filePath)) {
      fs.unlinkSync(dataset.filePath);
    }

    await Dataset.findByIdAndDelete(req.params.id);

    res.json({ message: "Dataset deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
