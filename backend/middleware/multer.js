const multer = require("multer");
const path = require("path");

// Temporary file storage in 'uploads' directory
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File filter to accept images and videos
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image and video files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit for videos
  fileFilter,
});

module.exports = {
  uploadSingle: upload.single("image"), // Single image upload
  uploadMultiple: upload.fields([
    { name: "mainImage", maxCount: 1 }, // Single main image
    { name: "colorImage", maxCount: 1 },
    { name: "subImages", maxCount: 10 }, // Multiple subimages
    { name: 'videos', maxCount: 5 }, // Single video file
    { name: 'videoThumbnails', maxCount: 5 },
  ]),
  upload
};
