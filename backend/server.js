// backend/server.js (or index.js)
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import logger from "./config/logger.js";
import adminRoutes from "./routes/adminRoutes.js";
import moviesRoutes from "./routes/moviesRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import favoritesRoutes from "./routes/favoritesRoutes.js";
import adminUsersRoutes from "./routes/adminUsers.js";

dotenv.config();

// DB
await connectDB?.();

// App
const app = express();

// ----- CORS -----
const allowList = (process.env.CLIENT_ORIGIN || "").split(",").map(s => s.trim()).filter(Boolean);
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // Postman / server-to-server
      if (allowList.length === 0 || allowList.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin ${origin}`));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// ----- Parsers (NOT for multipart) -----
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ----- Logging -----
app.use(
  morgan("dev", {
    stream: { write: (msg) => logger.info(msg.trim()) },
  })
);

// ----- Health -----
app.get("/health", (_req, res) => res.json({ ok: true }));

// ----- Routes -----
app.use("/api/admin", adminRoutes);
app.use("/api/movies", moviesRoutes); // includes multer upload for multipart
app.use("/api/auth", authRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/users", adminUsersRoutes);

// ----- 404 -----
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ----- Error handler -----
app.use((err, _req, res, _next) => {
  logger.error(err.stack || err.message);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Server error",
    // Avoid leaking internals in prod:
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

// ----- Start -----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`🚀 Server running on port ${PORT}`));
