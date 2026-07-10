import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./db.js";

import authRoutes from "./routes/auth.routes.js";
import tripsRoutes from "./routes/trips.routes.js";
import privateTripRoutes from "./routes/privateTripRequests.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "trip-backend",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripsRoutes);
app.use("/api/private-trip-requests", privateTripRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);

  res.status(err.status || 500).json({
    message: err.message || "Server error",
  });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  });