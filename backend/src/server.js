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

const privateTripRequestRoutes = require(
  "./src/routes/privateTripRequests"
);

const app = express();
const PORT = process.env.PORT || 5000;

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

const allowedOrigins = (
  process.env.FRONTEND_URL ||
  "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      /*
       * Allow requests without an origin,
       * such as Postman or direct browser requests.
       */
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
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

/*
|--------------------------------------------------------------------------
| Request body middleware
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Static uploaded files
|--------------------------------------------------------------------------
*/

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

/*
|--------------------------------------------------------------------------
| Basic routes
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| API routes
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);

app.use("/api/trips", tripRoutes);

app.use(
  "/api/private-trip-requests",
  privateTripRequestRoutes
);

/*
|--------------------------------------------------------------------------
| Route not found
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} was not found.`,
  });
});

/*
|--------------------------------------------------------------------------
| Global error handler
|--------------------------------------------------------------------------
*/

app.use((error, _req, res, _next) => {
  console.error("Server error:", error);

  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "Uploaded file cannot exceed 5 MB."
          : error.message,
    });
  }

  if (
    error.message?.includes(
      "Only JPG, PNG, and PDF"
    )
  ) {
    return res.status(400).json({
      success: false,
      message: error.message,
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

/*
|--------------------------------------------------------------------------
| Start server
|--------------------------------------------------------------------------
*/

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