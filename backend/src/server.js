import "dotenv/config";
import express from "express";
import cors from "cors";

import connectDatabase from "./db.js";
import tripsRouter from "./routes/trips.js";
import privateTripRequestsRouter from "./routes/privateTripRequests.routes.js";

const app = express();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Trip API is running.",
  });
});

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Backend is healthy.",
  });
});

// Public trips
app.use("/api/trips", tripsRouter);

// Private trip requests
app.use(
  "/api/private-trip-requests",
  privateTripRequestsRouter
);

// This must remain after all valid routes
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Unhandled server error:", error);

  return res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});

async function startServer() {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();