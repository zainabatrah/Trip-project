const express = require("express");
const mongoose = require("mongoose");

const PrivateTripRequest = require(
  "../models/PrivateTripRequest"
);
const Trip = require("../models/Trip");

const {
  requireAuth,
  requireOrganizer,
} = require(
  "../middleware/auth"
);

const router = express.Router();

const destinationPresets = [
  {
    key: "faraya",
    image: "/Images/Faraya.jpg",
    latitude: 34.0104,
    longitude: 35.8328,
  },
  {
    key: "batroun",
    image: "/Images/Batroun.jpg",
    latitude: 34.2554,
    longitude: 35.6581,
  },
  {
    key: "baalbek",
    image:
      "/Images/52de2359f6d93ff4a4b06402d9c80bfbfdbb5463_1200x630.jpg",
    latitude: 34.0047,
    longitude: 36.211,
  },
  {
    key: "qadisha",
    image: "/Images/qadisha-kadisha-valley.jpg",
    latitude: 34.2431,
    longitude: 35.9977,
  },
  {
    key: "saida",
    image: "/Images/Saida.jpg",
    latitude: 33.5606,
    longitude: 35.3758,
  },
  {
    key: "sidon",
    image: "/Images/Saida.jpg",
    latitude: 33.5606,
    longitude: 35.3758,
  },
  {
    key: "tyre",
    image: "/Images/Tyre-Beach-Lebanon.jpg",
    latitude: 33.2705,
    longitude: 35.2038,
  },
  {
    key: "anfeh",
    image: "/Images/AnfehSeaEscape.jpg",
    latitude: 34.3562,
    longitude: 35.7339,
  },
  {
    key: "chouf",
    image: "/Images/Lebanon-spring-1.jpg",
    latitude: 33.6973,
    longitude: 35.5655,
  },
  {
    key: "bcharre",
    image: "/Images/download.avif",
    latitude: 34.2509,
    longitude: 36.0106,
  },
  {
    key: "ehden",
    image: "/Images/E0ZceKeWYAc9XPV.jpg",
    latitude: 34.2905,
    longitude: 35.9544,
  },
  {
    key: "jezzine",
    image: "/Images/68.jpg",
    latitude: 33.5417,
    longitude: 35.5844,
  },
  {
    key: "laklouk",
    image:
      "/Images/Outdoor-Adventures-Lebanon_FT1_.webp",
    latitude: 34.145,
    longitude: 35.842,
  },
];

const genericDestinationImages = [
  "/Images/Libanon233.jpg",
  "/Images/Faraya.jpg",
  "/Images/Batroun.jpg",
  "/Images/Tyre-Beach-Lebanon.jpg",
  "/Images/AnfehSeaEscape.jpg",
  "/Images/Lebanon-spring-1.jpg",
  "/Images/E0ZceKeWYAc9XPV.jpg",
  "/Images/68.jpg",
];

function validId(id) {
  return mongoose.Types.ObjectId.isValid(
    id
  );
}

function isOrganizer(user) {
  return [
    "organizer",
    "admin",
  ].includes(
    String(
      user?.role || ""
    ).toLowerCase()
  );
}

function canAccess(
  user,
  request
) {
  if (isOrganizer(user)) {
    return true;
  }

  const sameClient =
    request.client &&
    String(request.client) ===
      String(user._id);

  const sameEmail =
    String(
      request.email || ""
    ).toLowerCase() ===
    String(
      user.email || ""
    ).toLowerCase();

  return Boolean(
    sameClient ||
      sameEmail
  );
}

function normalizeTransportation(
  value
) {
  const map = {
    car: "Car",
    van: "Van",
    minibus: "Minibus",
    bus: "Bus",
  };

  return map[
    String(value || "")
      .trim()
      .toLowerCase()
  ];
}

function validationError(
  error,
  res
) {
  if (
    isDatabaseUnavailableError(error)
  ) {
    return res
      .status(503)
      .json({
        success: false,
        message:
          "Database connection is currently unavailable. Please try again.",
      });
  }

  if (
    error?.name ===
    "ValidationError"
  ) {
    const errors =
      Object.values(
        error.errors
      ).map(
        (item) =>
          item.message
      );

    return res
      .status(400)
      .json({
        success: false,
        message:
          errors.join(" "),
        errors,
      });
  }

  return res
    .status(500)
    .json({
      success: false,
      message:
        error?.message ||
        "Unexpected server error.",
    });
}

function isDatabaseUnavailableError(
  error
) {
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

function normalizeTripTransportation(
  value
) {
  const normalized = String(
    value || ""
  )
    .trim()
    .toLowerCase();

  if (normalized === "car") {
    return "car";
  }

  return "bus";
}

function calculateDuration(
  startDate,
  endDate
) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return 1;
  }

  const millisecondsPerDay =
    1000 * 60 * 60 * 24;

  return Math.max(
    1,
    Math.round(
      (end - start) /
        millisecondsPerDay
    ) + 1
  );
}

function resolveDestinationPreset(
  destination
) {
  const normalized =
    String(destination || "")
      .trim()
      .toLowerCase();

  return (
    destinationPresets.find(
      (preset) =>
        normalized.includes(
          preset.key
        )
    ) || {
      image:
        pickGenericDestinationImage(
          normalized || "lebanon"
        ),
      latitude: 33.8938,
      longitude: 35.5018,
    }
  );
}

function pickGenericDestinationImage(
  seed
) {
  const text = String(seed || "");

  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash =
      (hash * 31 +
        text.charCodeAt(index)) >>>
      0;
  }

  return genericDestinationImages[
    hash %
      genericDestinationImages.length
  ];
}

function buildEditableRequestData(
  request,
  body
) {
  const title =
    body.title !== undefined
      ? String(body.title || "").trim()
      : request.title;

  const destination =
    body.destination !== undefined ||
    body.to !== undefined
      ? String(
          body.destination ||
            body.to ||
            ""
        ).trim()
      : request.destination;

  const startDate =
    body.startDate !== undefined
      ? new Date(body.startDate)
      : new Date(request.startDate);

  const endDate =
    body.endDate !== undefined
      ? new Date(body.endDate)
      : new Date(request.endDate);

  const transportation =
    body.transportation !== undefined ||
    body.vehicle !== undefined
      ? normalizeTransportation(
          body.transportation ||
            body.vehicle
        )
      : request.transportation;

  const travelers =
    body.travelers !== undefined
      ? Number(body.travelers)
      : Number(
          request.travelers
        );

  const budget =
    body.budget !== undefined
      ? Number(body.budget)
      : Number(request.budget);

  const notes =
    body.notes !== undefined
      ? String(body.notes || "").trim()
      : String(request.notes || "");

  return {
    title,
    destination,
    startDate,
    endDate,
    transportation,
    travelers,
    budget,
    notes,
  };
}

function validateEditableRequestData(
  data
) {
  if (!data.title) {
    return "Trip title is required.";
  }

  if (data.title.length < 3) {
    return "Trip title must contain at least 3 characters.";
  }

  if (!data.destination) {
    return "Destination is required.";
  }

  if (
    Number.isNaN(
      data.startDate.getTime()
    ) ||
    Number.isNaN(
      data.endDate.getTime()
    )
  ) {
    return "Valid start and end dates are required.";
  }

  if (data.endDate < data.startDate) {
    return "End date cannot be before the start date.";
  }

  if (!data.transportation) {
    return "Transportation must be Car, Van, Minibus, or Bus.";
  }

  if (
    !Number.isInteger(
      data.travelers
    ) ||
    data.travelers < 1
  ) {
    return "Travelers must be a positive whole number.";
  }

  if (
    !Number.isFinite(data.budget) ||
    data.budget < 0
  ) {
    return "Budget must be a non-negative number.";
  }

  if (data.notes.length > 800) {
    return "Notes cannot exceed 800 characters.";
  }

  return "";
}

function buildTripFromRequest(
  request
) {
  const duration =
    calculateDuration(
      request.startDate,
      request.endDate
    );

  const destinationPreset =
    resolveDestinationPreset(
      request.destination
    );

  const transportation =
    normalizeTripTransportation(
      request.transportation
    );

  return {
    title: request.title,
    country: "Lebanon",
    from: "Private Pickup",
    to: request.destination,
    date: request.startDate,
    description: `Approved private trip to ${request.destination} for ${request.travelers} traveler(s) using ${String(
      request.transportation || transportation
    ).toLowerCase()} transportation.`,
    photo:
      destinationPreset.image,
    price: Number(
      request.budget || 0
    ),
    duration,
    numberOfTravelers:
      Number(
        request.travelers || 1
      ),
    reservedTravelers:
      Number(
        request.travelers || 1
      ),
    status: "planned",
    transportation,
    tripType:
      Number(
        request.travelers || 0
      ) >= 4
        ? "family"
        : "relax",
    rating: 0,
    inclusions: [
      "Approved private trip",
      `${request.transportation} transportation`,
      `${request.travelers} traveler(s)`,
    ],
    places: [
      {
        city: request.destination,
        image:
          destinationPreset.image,
        latitude:
          destinationPreset.latitude,
        longitude:
          destinationPreset.longitude,
        days: duration,
      },
    ],
  };
}

async function syncApprovedTrip(
  request
) {
  const tripData =
    buildTripFromRequest(request);

  if (request.approvedTripId) {
    const existingTrip =
      await Trip.findById(
        request.approvedTripId
      );

    if (existingTrip) {
      Object.assign(
        existingTrip,
        tripData
      );

      await existingTrip.save();

      return existingTrip._id;
    }
  }

  const trip =
    await Trip.create(tripData);

  return trip._id;
}

router.get(
  "/",
  requireAuth,
  requireOrganizer,
  async (_req, res, next) => {
    try {
      const requests =
        await PrivateTripRequest.find(
          {}
        )
          .sort({
            createdAt: -1,
          })
          .lean();

      return res
        .status(200)
        .json({
          success: true,
          count:
            requests.length,
          requests,
        });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/mine",
  requireAuth,
  async (req, res, next) => {
    try {
      const requests =
        await PrivateTripRequest.find(
          {
            $or: [
              {
                client:
                  req.user._id,
              },
              {
                email:
                  req.user.email.toLowerCase(),
              },
            ],
          }
        )
          .sort({
            createdAt: -1,
          })
          .lean();

      return res
        .status(200)
        .json({
          success: true,
          count:
            requests.length,
          requests,
        });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/",
  requireAuth,
  async (req, res) => {
    try {
      const title = String(
        req.body.title || ""
      ).trim();

      const destination =
        String(
          req.body.destination ||
            req.body.to ||
            ""
        ).trim();

      const startDate =
        new Date(
          req.body.startDate ||
            req.body.date
        );

      const endDate =
        new Date(
          req.body.endDate ||
            req.body.startDate ||
            req.body.date
        );

      const transportation =
        normalizeTransportation(
          req.body.transportation ||
            req.body.vehicle
        );

      const travelers =
        Number(
          req.body.travelers ??
            req.body.passengers
        );

      const budget =
        Number(
          req.body.budget
        );

      const notes = String(
        req.body.notes || ""
      ).trim();

      if (
        !title ||
        !destination
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Trip title and destination are required.",
          });
      }

      if (
        Number.isNaN(
          startDate.getTime()
        ) ||
        Number.isNaN(
          endDate.getTime()
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Valid start and end dates are required.",
          });
      }

      if (
        endDate <
        startDate
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "End date cannot be before the start date.",
          });
      }

      if (
        !transportation
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Transportation must be Car, Van, Minibus, or Bus.",
          });
      }

      if (
        !Number.isInteger(
          travelers
        ) ||
        travelers < 1
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Travelers must be a positive whole number.",
          });
      }

      if (
        !Number.isFinite(
          budget
        ) ||
        budget < 0
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Budget must be a non-negative number.",
          });
      }

      const request =
        await PrivateTripRequest.create(
          {
            client:
              req.user._id,

            title,
            destination,
            startDate,
            endDate,
            transportation,
            travelers,
            budget,
            notes,

            clientName:
              req.user.fullName ||
              "Client",

            email:
              req.user.email,

            status:
              "PENDING",

            organizerReply:
              "",

            reviewedAt:
              null,

            messages: [],
          }
        );

      return res
        .status(201)
        .json({
          success: true,
          message:
            "Private trip request sent successfully.",
          request,
        });
    } catch (error) {
      return validationError(
        error,
        res
      );
    }
  }
);

router.get(
  "/:id/messages",
  requireAuth,
  async (req, res, next) => {
    try {
      if (
        !validId(
          req.params.id
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid request ID.",
          });
      }

      const request =
        await PrivateTripRequest.findById(
          req.params.id
        ).lean();

      if (!request) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Private trip request not found.",
          });
      }

      if (
        !canAccess(
          req.user,
          request
        )
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message:
              "You cannot access this request.",
          });
      }

      return res
        .status(200)
        .json({
          success: true,
          messages:
            request.messages ||
            [],
        });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/:id/messages",
  requireAuth,
  async (req, res) => {
    try {
      if (
        !validId(
          req.params.id
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid request ID.",
          });
      }

      const text = String(
        req.body.text || ""
      ).trim();

      if (!text) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Message text is required.",
          });
      }

      if (
        text.length > 1000
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Message cannot exceed 1000 characters.",
          });
      }

      const request =
        await PrivateTripRequest.findById(
          req.params.id
        );

      if (!request) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Private trip request not found.",
          });
      }

      if (
        !canAccess(
          req.user,
          request
        )
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message:
              "You cannot access this request.",
          });
      }

      const sender =
        isOrganizer(
          req.user
        )
          ? "organizer"
          : "client";

      request.messages.push({
        sender,
        text,
      });

      await request.save();

      const message =
        request.messages[
          request.messages.length -
            1
        ];

      return res
        .status(201)
        .json({
          success: true,
          message,
        });
    } catch (error) {
      return validationError(
        error,
        res
      );
    }
  }
);

router.post(
  "/:id/organizer-messages",
  requireAuth,
  requireOrganizer,
  async (req, res) => {
    try {
      if (
        !validId(
          req.params.id
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid request ID.",
          });
      }

      const text = String(
        req.body.text || ""
      ).trim();

      if (!text) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Message text is required.",
          });
      }

      if (
        text.length > 1000
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Message cannot exceed 1000 characters.",
          });
      }

      const request =
        await PrivateTripRequest.findById(
          req.params.id
        );

      if (!request) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Private trip request not found.",
          });
      }

      request.messages.push({
        sender:
          "organizer",
        text,
      });

      await request.save();

      const message =
        request.messages[
          request.messages.length -
            1
        ];

      return res
        .status(201)
        .json({
          success: true,
          message,
        });
    } catch (error) {
      return validationError(
        error,
        res
      );
    }
  }
);

router.patch(
  "/:id",
  requireAuth,
  requireOrganizer,
  async (req, res) => {
    try {
      if (
        !validId(
          req.params.id
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid request ID.",
          });
      }

      const request =
        await PrivateTripRequest.findById(
          req.params.id
        );

      if (!request) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Private trip request not found.",
          });
      }

      const nextData =
        buildEditableRequestData(
          request,
          req.body
        );

      const validationMessage =
        validateEditableRequestData(
          nextData
        );

      if (validationMessage) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              validationMessage,
          });
      }

      request.title = nextData.title;
      request.destination =
        nextData.destination;
      request.startDate =
        nextData.startDate;
      request.endDate =
        nextData.endDate;
      request.transportation =
        nextData.transportation;
      request.travelers =
        nextData.travelers;
      request.budget = nextData.budget;
      request.notes = nextData.notes;

      if (
        request.status ===
        "APPROVED"
      ) {
        request.approvedTripId =
          await syncApprovedTrip(
            request
          );
      }

      await request.save();

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Private trip request updated successfully.",
          request,
        });
    } catch (error) {
      return validationError(
        error,
        res
      );
    }
  }
);

router.patch(
  "/:id/status",
  requireAuth,
  requireOrganizer,
  async (req, res) => {
    try {
      if (
        !validId(
          req.params.id
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid request ID.",
          });
      }

      const status = String(
        req.body.status || ""
      )
        .trim()
        .toUpperCase();

      const organizerReply =
        String(
          req.body.organizerReply ||
            req.body.organizerMessage ||
            ""
        ).trim();

      const allowedStatuses = [
        "PENDING",
        "APPROVED",
        "REJECTED",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Status must be PENDING, APPROVED, or REJECTED.",
          });
      }

      if (
        organizerReply.length >
        1000
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Organizer reply cannot exceed 1000 characters.",
          });
      }

      const request =
        await PrivateTripRequest.findById(
          req.params.id
        );

      if (!request) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Private trip request not found.",
          });
      }

      const previousReply = String(
        request.organizerReply || ""
      ).trim();

      request.status = status;
      request.organizerReply =
        organizerReply;
      request.reviewedAt =
        status === "PENDING"
          ? null
          : new Date();

      if (
        status === "APPROVED"
      ) {
        request.approvedTripId =
          await syncApprovedTrip(
            request
          );
      } else if (
        request.approvedTripId
      ) {
        await Trip.findByIdAndDelete(
          request.approvedTripId
        );

        request.approvedTripId = null;
      }

      if (
        organizerReply &&
        organizerReply !==
          previousReply
      ) {
        request.messages.push({
          sender: "organizer",
          text: organizerReply,
        });
      }

      await request.save();

      const successMessage =
        status === "APPROVED"
          ? "Request approved and added to the trips list."
          : status === "REJECTED"
            ? "Request rejected and removed from the trips list."
            : "Request reset to pending and removed from the trips list.";

      return res
        .status(200)
        .json({
          success: true,
          message:
            successMessage,
          request,
        });
    } catch (error) {
      return validationError(
        error,
        res
      );
    }
  }
);

router.get(
  "/:id",
  requireAuth,
  async (req, res, next) => {
    try {
      if (
        !validId(
          req.params.id
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid request ID.",
          });
      }

      const request =
        await PrivateTripRequest.findById(
          req.params.id
        ).lean();

      if (!request) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Private trip request not found.",
          });
      }

      if (
        !canAccess(
          req.user,
          request
        )
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message:
              "You cannot access this request.",
          });
      }

      return res
        .status(200)
        .json({
          success: true,
          request,
        });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  requireAuth,
  async (req, res, next) => {
    try {
      if (
        !validId(
          req.params.id
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid request ID.",
          });
      }

      const request =
        await PrivateTripRequest.findById(
          req.params.id
        );

      if (!request) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Private trip request not found.",
          });
      }

      if (
        !canAccess(
          req.user,
          request
        )
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message:
              "You cannot delete this request.",
          });
      }

      if (request.approvedTripId) {
        await Trip.findByIdAndDelete(
          request.approvedTripId
        );
      }

      await request.deleteOne();

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Private trip request deleted successfully.",
        });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
