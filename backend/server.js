const path = require("path");

/*
|--------------------------------------------------------------------------
| Environment variables
|--------------------------------------------------------------------------
|
| The .env file must be located at:
| backend/.env
|
*/

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const express = require("express");
const cors = require("cors");
const multer = require("multer");

const connectDB = require("./db");

/*
|--------------------------------------------------------------------------
| Validate required environment variables
|--------------------------------------------------------------------------
*/

const requiredEnvironmentVariables = [
  "MONGODB_URI",
  "JWT_SECRET",
];

for (const variableName of requiredEnvironmentVariables) {
  if (!process.env[variableName]?.trim()) {
    console.error(
      `Missing required environment variable: ${variableName}`
    );

    process.exit(1);
  }
}

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This assumes your routes folder is located directly inside backend:
|
| backend/
| ├── routes/
| ├── models/
| ├── middleware/
| ├── server.js
| └── db.js
|
*/

const authRoutes = require(
  "./routes/auth.routes"
);

const tripRoutes = require(
  "./routes/trips"
);

const privateTripRequestRoutes = require(
  "./routes/privateTripRequests"
);
const paymentRoutes = require("./routes/paymentRoutes");
const bookingRoute = require("./routes/bookingRoutes");
const userRoutes=require("./routes/userRoutes");
const socialRoutes = require("./routes/socialRoutes");
const app = express();

const PORT =
  Number(process.env.PORT) || 5000;

/*
|--------------------------------------------------------------------------
| Database error detection
|--------------------------------------------------------------------------
*/

function isDatabaseUnavailableError(error) {
  const message = String(
    error?.message || ""
  ).toLowerCase();

  const errorCode = String(
    error?.code ||
      error?.cause?.code ||
      ""
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
    ].includes(errorCode) ||
    message.includes(
      "server selection"
    ) ||
    message.includes(
      "enotfound"
    ) ||
    message.includes(
      "econnrefused"
    ) ||
    message.includes(
      "timed out"
    )
  );
}

/*
|--------------------------------------------------------------------------
| CORS configuration
|--------------------------------------------------------------------------
|
| FRONTEND_URL or CLIENT_URL may contain multiple
| comma-separated origins.
|
| Example:
| CLIENT_URL=http://localhost:5173,http://127.0.0.1:5173
|
*/

const frontendUrls =
  process.env.FRONTEND_URL ||
  process.env.CLIENT_URL ||
  "http://localhost:5173,http://127.0.0.1:5173";

const allowedOrigins = String(
  frontendUrls
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      /*
       * Requests from Postman, curl,
       * server-to-server calls, or direct browser
       * navigation may not contain an Origin header.
       */
      if (!origin) {
        return callback(null, true);
      }

      if (
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      const corsError = new Error(
        `Origin ${origin} is not allowed by CORS.`
      );

      corsError.status = 403;

      return callback(corsError);
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

/*
|--------------------------------------------------------------------------
| Request-body middleware
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
|
| The first middleware serves:
| backend/uploads
|
| The second middleware serves:
| backend/src/uploads
|
| Keeping both temporarily prevents old uploaded-file
| paths from breaking.
|
*/

app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      "uploads"
    )
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

/*
|--------------------------------------------------------------------------
| Basic routes
|--------------------------------------------------------------------------
*/

app.get("/", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "Trip API is running.",
  });
});

app.get(
  "/api/health",
  (_req, res) => {
    return res.status(200).json({
      success: true,
      message: "Backend is working.",
      timestamp:
        new Date().toISOString(),
    });
  }
);

/*
|--------------------------------------------------------------------------
| API routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/trips",
  tripRoutes
);

app.use(
  "/api/private-trip-requests",
  privateTripRequestRoutes
);

app.use("/api/payment", paymentRoutes);
app.use("/api/bookings", bookingRoute);
app.use(
    "/api/users",
    userRoutes
);
app.use(
  "/api/social",
  socialRoutes
);
/*
|--------------------------------------------------------------------------
| Route-not-found handler
|--------------------------------------------------------------------------
|
| This must remain after all valid routes.
|
*/

app.use((req, res) => {
  return res.status(404).json({
    success: false,

    message:
      `Route ${req.method} ${req.originalUrl} was not found.`,
  });
});

/*
|--------------------------------------------------------------------------
| Global error handler
|--------------------------------------------------------------------------
|
| This must be the final Express middleware.
|
*/

app.use(
  (
    error,
    _req,
    res,
    _next
  ) => {
    console.error(
      "Unhandled server error:",
      error
    );

    if (
      isDatabaseUnavailableError(
        error
      )
    ) {
      return res.status(503).json({
        success: false,

        message:
          "Database connection is currently unavailable. Please try again.",
      });
    }

    if (
      error instanceof
      multer.MulterError
    ) {
      return res.status(400).json({
        success: false,

        message:
          error.code ===
          "LIMIT_FILE_SIZE"
            ? "The uploaded file cannot exceed 5 MB."
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

    /*
     * MongoDB duplicate-key error.
     * This commonly occurs when an email
     * address is already registered.
     */
    if (
      error.code === 11000
    ) {
      const duplicatedField =
        Object.keys(
          error.keyPattern || {}
        )[0] || "value";

      return res.status(409).json({
        success: false,

        message:
          `${duplicatedField} already exists.`,
      });
    }

    /*
     * Mongoose validation errors.
     */
    if (
      error.name ===
      "ValidationError"
    ) {
      const messages =
        Object.values(
          error.errors || {}
        )
          .map(
            (validationError) =>
              validationError.message
          )
          .filter(Boolean);

      return res.status(400).json({
        success: false,

        message:
          messages.join(" ") ||
          "Invalid request data.",
      });
    }

    /*
     * Invalid MongoDB object identifier.
     */
    if (
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid resource ID.",
      });
    }

    const requestedStatus =
      Number(
        error.status ||
          error.statusCode
      );

    const statusCode =
      Number.isInteger(
        requestedStatus
      ) &&
      requestedStatus >= 400 &&
      requestedStatus <= 599
        ? requestedStatus
        : 500;

    return res
      .status(statusCode)
      .json({
        success: false,

        message:
          statusCode === 500
            ? "An unexpected server error occurred."
            : error.message ||
              "Request failed.",
      });
  }
);

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

      console.log(
        `Allowed frontend origins: ${allowedOrigins.join(
          ", "
        )}`
      );
    });
  } catch (error) {
    console.error(
      "Server failed to start:"
    );

    console.error(
      error?.message || error
    );

    process.exit(1);
  }
}

startServer();
