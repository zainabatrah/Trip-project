require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");

const connectDB = require("./db");

const authRoutes = require(
  "./src/routes/auth.routes"
);

const tripRoutes = require(
  "./src/routes/trips"
);
const feedbackRoutes = require(
  "./src/routes/feedback"
);
const privateTripRequestRoutes = require(
  "./src/routes/privateTripRequests"
);

const app = express();
const PORT = Number(process.env.PORT) || 5000;

function isDatabaseUnavailableError(error) {
  const message = String(
    error?.message || ""
  ).toLowerCase();

  const causeCode = String(
    error?.cause?.code || ""
  ).toUpperCase();

  return (
    error?.name ===
      "MongoServerSelectionError" ||
    error?.name ===
      "MongoNetworkError" ||
    [
      "ENOTFOUND",
      "ECONNREFUSED",
      "ETIMEDOUT",
    ].includes(causeCode) ||
    message.includes(
      "server selection"
    ) ||
    message.includes("enotfound") ||
    message.includes("econnrefused") ||
    message.includes("timed out")
  );
}

const allowedOrigins = String(
  process.env.FRONTEND_URL ||
    "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      return callback(
        new Error(
          `Origin ${origin} is not allowed by CORS.`
        )
      );
    },

    credentials: true,
  })
);

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      "src",
      "uploads"
    )
  )
);

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Trip API is running.",
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is working.",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);

app.use(
  "/api/private-trip-requests",
  privateTripRequestRoutes
);
app.use("/api/feedback", feedbackRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} was not found.`,
  });
});

app.use((error, _req, res, _next) => {
  console.error("Unhandled server error:", error);

  if (isDatabaseUnavailableError(error)) {
    return res.status(503).json({
      success: false,
      message:
        "Database connection is currently unavailable. Please try again.",
    });
  }

  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "The uploaded file cannot exceed 5 MB."
          : error.message,
    });
  }

  if (
    error.message?.includes(
      "not allowed by CORS"
    )
  ) {
    return res.status(403).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(
    error.status || 500
  ).json({
    success: false,
    message:
      error.message ||
      "An unexpected server error occurred.",
  });
});

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `Server running at http://localhost:${PORT}`
      );

      console.log(
        `Health check: http://localhost:${PORT}/api/health`
      );
    });
  } catch (error) {
    console.error(
      "Server failed to start:"
    );

    console.error(error);

    process.exit(1);
  }
}

startServer();
