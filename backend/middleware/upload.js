// backend/middleware/upload.js
import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB per image
}).fields([
  { name: "mainPoster", maxCount: 1 },
  { name: "backgroundPoster", maxCount: 1 },
  { name: "mobilePoster", maxCount: 1 },
]);
