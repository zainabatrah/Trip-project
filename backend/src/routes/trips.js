const express = require("express");
const mongoose = require("mongoose");

const Trip = require(
  "../models/Trip"
);

const getCoordinates = require(
  "../utils/geocode"
);

const {
  requireAuth,
  requireOrganizer,
} = require(
  "../middleware/auth"
);

const router = express.Router();

const allowedFields = [
  "title",
  "country",
  "from",
  "to",
  "date",
  "fromLocation",
  "toLocation",
  "description",
  "photo",
  "price",
  "duration",
  "numberOfTravelers",
  "reservedTravelers",
  "status",
  "transportation",
  "tripType",
  "rating",
  "inclusions",
  "places",
  "stops"
];

const allowedStatuses = [
  "planned",
  "ongoing",
  "completed",
];

const allowedTransportation = [
  "flight",
  "train",
  "bus",
  "car",
];

const allowedTripTypes = [
  "adventure",
  "relax",
  "business",
  "family",
];

const defaultTripImage =
  "/Images/Libanon233.jpg";

const availableTripImages = [
  "/Images/Jeita.jpg",
  "/Images/Faraya.jpg",
  "/Images/Batroun.jpg",
  "/Images/Jeita.jpg",
  "/Images/52de2359f6d93ff4a4b06402d9c80bfbfdbb5463_1200x630.jpg",
  "/Images/qadisha-kadisha-valley.jpg",
  "/Images/Saida.jpg",
  "/Images/Tyre-Beach-Lebanon.jpg",
  "/Images/AnfehSeaEscape.jpg",
  "/Images/Lebanon-spring-1.jpg",
  "/Images/download.avif",
  "/Images/download.jpg",
  "/Images/E0ZceKeWYAc9XPV.jpg",
  "/Images/68.jpg",
  "/Images/South.jpg",
  "/Images/Outdoor-Adventures-Lebanon_FT1_.webp",
  "/Images/mosque-and-shops-in-the-medina-old-town-of-tripoli-libya-north-africa-BPMJ5G.jpg",
  defaultTripImage,
];

const imageAliasMap = new Map(
  [
    [
      "/images/tyre.jpg",
      "/Images/Tyre-Beach-Lebanon.jpg",
    ],
    [
      "/images/sidon.jpg",
      "/Images/Saida.jpg",
    ],
    [
      "/images/jeita-byblos.jpg",
      "/Images/Batroun.jpg",
    ],
    [
  "/images/jeita.jpg",
  "/Images/Jeita.jpg",
],
    [
      "/images/byblos.jpg",
      "/Images/Batroun.jpg",
    ],
    [
      "/images/cedars.jpg",
      "/Images/Outdoor-Adventures-Lebanon_FT1_.webp",
    ],
    [
      "/images/bcharre.jpg",
      "/Images/download.avif",
    ],
    [
      "/images/cedars-of-god.jpg",
      "/Images/download.avif",
    ],
    [
      "/images/baalbek.jpg",
      "/Images/52de2359f6d93ff4a4b06402d9c80bfbfdbb5463_1200x630.jpg",
    ],
    [
      "/images/baalbek-temples.jpg",
      "/Images/52de2359f6d93ff4a4b06402d9c80bfbfdbb5463_1200x630.jpg",
    ],
    [
      "/images/chouf.jpg",
      "/Images/Lebanon-spring-1.jpg",
    ],
    [
      "/images/beiteddine.jpg",
      "/Images/images (3).jpg",
    ],
    [
      "/images/deir-el-qamar.jpg",
      "/Images/images (4).jpg",
    ],
  ]
);

const availableTripImageMap =
  new Map(
    availableTripImages.map((image) => [
      image.toLowerCase(),
      image,
    ])
  );

const destinationImageMap = {
  faraya: "/Images/Faraya.jpg",
  batroun: "/Images/Batroun.jpg",
  byblos: "/Images/Batroun.jpg",
  baalbek:
    "/Images/52de2359f6d93ff4a4b06402d9c80bfbfdbb5463_1200x630.jpg",
  qadisha:
    "/Images/qadisha-kadisha-valley.jpg",
  saida: "/Images/Saida.jpg",
  sidon: "/Images/Saida.jpg",
  tyre: "/Images/Tyre-Beach-Lebanon.jpg",
  anfeh: "/Images/AnfehSeaEscape.jpg",
  chouf: "/Images/Lebanon-spring-1.jpg",
  bcharre: "/Images/download.avif",
  ehden: "/Images/E0ZceKeWYAc9XPV.jpg",
  jezzine: "/Images/68.jpg",
  laklouk:
    "/Images/Outdoor-Adventures-Lebanon_FT1_.webp",
  jeita: "/Images/download.jpg",
  cedars:
    "/Images/Outdoor-Adventures-Lebanon_FT1_.webp",
  beiteddine:
    "/Images/images (3).jpg",
  "deir el qamar":
    "/Images/images (4).jpg",
  beirut:
    "/Images/mosque-and-shops-in-the-medina-old-town-of-tripoli-libya-north-africa-BPMJ5G.jpg",
};

function validId(id) {
  return mongoose.Types.ObjectId.isValid(
    id
  );
}

function hashString(value) {
  let hash = 0;

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    hash =
      (hash * 31 +
        value.charCodeAt(index)) >>>
      0;
  }

  return hash;
}

function normalizeDurationValue(value) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return 0;
  }

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return Math.max(0, value);
  }

  const numericValue =
    Number(value);

  if (
    Number.isFinite(numericValue)
  ) {
    return Math.max(
      0,
      numericValue
    );
  }

  if (
    typeof value === "object"
  ) {
    const amount = Number(
      value.value ??
        value.amount ??
        value.days ??
        value.hours
    );

    if (!Number.isFinite(amount)) {
      return 0;
    }

    const unit = String(
      value.unit || ""
    ).toLowerCase();

    if (
      unit.includes("hour")
    ) {
      return Math.max(
        1,
        Math.ceil(amount / 24)
      );
    }

    return Math.max(
      1,
      Math.ceil(amount)
    );
  }

  return 0;
}

function resolveDestinationImage(
  ...values
) {
  const combined = values
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  for (const [key, image] of Object.entries(
    destinationImageMap
  )) {
    if (
      combined.includes(key)
    ) {
      return image;
    }
  }

  return availableTripImages[
    hashString(
      combined || "trip"
    ) %
      availableTripImages.length
  ];
}

function normalizeImagePath(value, fallback) {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return fallback;
  }

  const lower = normalized.toLowerCase();

  // Fix old names
  if (imageAliasMap.has(lower)) {
    return imageAliasMap.get(lower);
  }

  // Keep known images
  if (availableTripImageMap.has(lower)) {
    return availableTripImageMap.get(lower);
  }

  // IMPORTANT:
  // Keep any image stored in MongoDB
  // Example:
  // /Images/trips_imgs/south.jpg
  if (normalized.startsWith("/Images/")) {
    return normalized;
  }

  return fallback;
}

function normalizePlace(
  place,
  trip
) {
  const fallbackImage =
    resolveDestinationImage(
      place?.city,
      trip?.to,
      trip?.title
    );

  return {
    ...place,
    image: normalizeImagePath(
      place?.image,
      fallbackImage
    ),
    days:
      normalizeDurationValue(
        place?.days ??
          place?.duration
      ) || 1,
  };
}

function normalizeTripResponse(
  trip
) {
  const fallbackImage =
    resolveDestinationImage(
      trip?.to,
      trip?.title,
      trip?.country
    );

  return {
    ...trip,
    description: String(
      trip?.description || ""
    ),
    photo: normalizeImagePath(
      trip?.photo,
      fallbackImage
    ),
    duration:
      normalizeDurationValue(
        trip?.duration
      ) || 1,
    price: Number(
      trip?.price || 0
    ),
    rating: Number(
      trip?.rating || 0
    ),
    numberOfTravelers: Number(
      trip?.numberOfTravelers || 0
    ),
    reservedTravelers: Number(
      trip?.reservedTravelers || 0
    ),
    inclusions: Array.isArray(
      trip?.inclusions
    )
      ? trip.inclusions
      : [],
    places: Array.isArray(
      trip?.places
    )
      ? trip.places.map((place) =>
          normalizePlace(
            place,
            trip
          )
        )
      : [],
  };
}

function getAllowedFields(body) {
  const result = {};

  for (
    const field of
    allowedFields
  ) {
    if (
      body[field] !==
      undefined
    ) {
      result[field] =
        body[field];
    }
  }

  return result;
}

function normalizeTripData(data) {
  const normalized = {
    ...data,
  };

  const stringFields = [
    "title",
    "country",
    "from",
    "to",
    "description",
    "photo",
    "status",
    "transportation",
    "tripType",
  ];

  for (
    const field of
    stringFields
  ) {
    if (
      normalized[field] !==
      undefined
    ) {
      normalized[field] =
        String(
          normalized[field]
        ).trim();
    }
  }

  if (
    normalized.status
  ) {
    normalized.status =
      normalized.status.toLowerCase();
  }

  if (
    normalized.transportation
  ) {
    normalized.transportation =
      normalized.transportation.toLowerCase();
  }

  if (
    normalized.tripType
  ) {
    normalized.tripType =
      normalized.tripType.toLowerCase();
  }

  const numericFields = [
    "price",
    "duration",
    "numberOfTravelers",
    "reservedTravelers",
    "rating",
  ];

  for (
    const field of
    numericFields
  ) {
    if (
      normalized[field] !==
        undefined &&
      normalized[field] !==
        ""
    ) {
      normalized[field] =
        Number(
          normalized[field]
        );
    }
  }

  if (normalized.date) {
    normalized.date =
      new Date(
        normalized.date
      );
  }

  return normalized;
}

function addDefaults(data) {
  return {
    ...data,

    description:
      data.description ||
      "",

    photo:
      data.photo || "",

    price:
      data.price ?? 0,

    duration:
      data.duration ?? 0,

    numberOfTravelers:
      data.numberOfTravelers ??
      1,

    reservedTravelers:
      data.reservedTravelers ??
      0,

    status:
      data.status ||
      "planned",

    transportation:
      data.transportation ||
      "flight",

    tripType:
      data.tripType ||
      "adventure",

    rating:
      data.rating ?? 0,

    inclusions:
      Array.isArray(
        data.inclusions
      )
        ? data.inclusions
        : [],

     places:
      Array.isArray(data.places)
        ? data.places
        : [],

    stops:
      Array.isArray(data.stops)
        ? data.stops
        : [],
  };
}

function validateTrip(data) {
  const requiredFields = [
    "title",
    "country",
    "from",
    "to",
  ];

  for (
    const field of
    requiredFields
  ) {
    if (
      !String(
        data[field] || ""
      ).trim()
    ) {
      return `${field} is required.`;
    }
  }

  const date =
    new Date(data.date);

  if (
    !data.date ||
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "A valid trip date is required.";
  }

  if (
    !allowedStatuses.includes(
      data.status
    )
  ) {
    return `Status must be one of: ${allowedStatuses.join(
      ", "
    )}.`;
  }

  if (
    !allowedTransportation.includes(
      data.transportation
    )
  ) {
    return `Transportation must be one of: ${allowedTransportation.join(
      ", "
    )}.`;
  }

  if (
    !allowedTripTypes.includes(
      data.tripType
    )
  ) {
    return `Trip type must be one of: ${allowedTripTypes.join(
      ", "
    )}.`;
  }

  if (
    !Number.isFinite(
      data.price
    ) ||
    data.price < 0
  ) {
    return "Price must be a non-negative number.";
  }

  if (
    !Number.isFinite(
      data.duration
    ) ||
    data.duration < 0
  ) {
    return "Duration must be a non-negative number.";
  }

  if (
    !Number.isInteger(
      data.numberOfTravelers
    ) ||
    data.numberOfTravelers <
      1
  ) {
    return "Number of travelers must be a positive integer.";
  }

  if (
    !Number.isInteger(
      data.reservedTravelers
    ) ||
    data.reservedTravelers <
      0
  ) {
    return "Reserved travelers must be a non-negative integer.";
  }

  if (
    data.reservedTravelers >
    data.numberOfTravelers
  ) {
    return "Reserved travelers cannot exceed total travelers.";
  }

  if (
    !Number.isFinite(
      data.rating
    ) ||
    data.rating < 0 ||
    data.rating > 5
  ) {
    return "Rating must be between 0 and 5.";
  }

  return null;
}

router.get(
  "/",
  async (_req, res, next) => {
    try {
      const trips =
        await Trip.find({})
          .sort({
            date: 1,
          });

      const normalizedTrips = trips.map((trip) =>
  normalizeTripResponse(trip.toJSON())
);

      return res
        .status(200)
        .json({
          success: true,
          count:
            normalizedTrips.length,
          trips:
            normalizedTrips,
        });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:id",
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
              "Invalid trip ID.",
          });
      }

      const trip =
        await Trip.findById(
          req.params.id
        ).lean();

      if (!trip) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Trip not found.",
          });
      }

      return res
        .status(200)
        .json({
          success: true,
          trip:
            normalizeTripResponse(
              trip
            ),

          weather: [],
        });
    } catch (error) {
      next(error);
    }
  }
);
router.post(
  "/",
  async (req, res, next) => {

    console.log("CREATE TRIP REQUEST RECEIVED");

    try {

      let tripData = getAllowedFields(req.body);

      tripData = normalizeTripData(tripData);

      tripData = addDefaults(tripData);

      const validationError = validateTrip(tripData);

      if (validationError) {
        return res.status(400).json({
          success: false,
          message: validationError,
        });
      }

      // From
      const fromLocation = await getCoordinates(tripData.from);

      // To
      const toLocation = await getCoordinates(tripData.to);

      tripData.fromLocation = fromLocation;
      tripData.toLocation = toLocation;

          // Stops
if (Array.isArray(tripData.stops)) {

  for (const stop of tripData.stops) {

    const location = await getCoordinates(stop.name);

    if (location) {
      stop.lat = location.lat;
      stop.lng = location.lng;
    }
  }
}
        

      

      console.log("FROM:", tripData.fromLocation);
      console.log("STOPS:", tripData.stops);
      console.log("TO:", tripData.toLocation);

      const trip = await Trip.create(tripData);

      return res.status(201).json({
        success: true,
        message: "Trip created successfully.",
        trip,
      });

    } catch (error) {
      next(error);
    }

  }
);
router.put(
  "/:id",
  requireAuth,
  requireOrganizer,
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
              "Invalid trip ID.",
          });
      }

      const existingTrip =
        await Trip.findById(
          req.params.id
        );

      if (
        !existingTrip
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Trip not found.",
          });
      }
      let updateData =
        getAllowedFields(
          req.body
        );

      updateData =
        normalizeTripData(
          updateData
        );

      const completeData =
        addDefaults({
          ...existingTrip.toObject(),
          ...updateData,
        });

      const validationError =
        validateTrip(
          completeData
        );

      if (
        validationError
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              validationError,
          });
      }

      const updatedTrip =
        await Trip.findByIdAndUpdate(
          req.params.id,
          updateData,
          {
            new: true,
            runValidators: true,
          }
        );

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Trip updated successfully.",
          trip:
            updatedTrip,
        });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  requireAuth,
  requireOrganizer,
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
              "Invalid trip ID.",
          });
      }

      const trip =
        await Trip.findByIdAndDelete(
          req.params.id
        );

      if (!trip) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Trip not found.",
          });
      }

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Trip deleted successfully.",
        });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
