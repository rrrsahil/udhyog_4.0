import multer from "multer";
import path from "path";
import fs from "fs";

/* ==============================
   CREATE UPLOAD FOLDER IF NOT EXISTS
============================== */
const uploadDir = path.resolve("uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* ==============================
   STORAGE CONFIG
============================== */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

/* ==============================
   FILE FILTER
============================== */
const fileFilter = (req, file, cb) => {
  const allowedTypes = [".csv", ".xlsx", ".xls"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedTypes.includes(ext)) {
    return cb(new Error("Only CSV and Excel files are allowed"));
  }

  cb(null, true);
};

/* ==============================
   MULTER EXPORT
============================== */
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export default upload;
