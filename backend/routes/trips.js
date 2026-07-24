const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const Trip = require("../models/Trip");
const getCoordinates = require(
  "../src/utils/geocode"
);

const {
  requireAuth,
  requireOrganizer,
} = require("../middleware/auth");

const router = express.Router();

const allowedFields = [
  "title",
  "country",
  "from",
  "to",
  "date",
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

/*
|--------------------------------------------------------------------------
| Image configuration
|--------------------------------------------------------------------------
*/

const defaultTripImage =
  "/Images/Libanon233.jpg";

const publicImagesDirectory =
  path.resolve(
    __dirname,
    "../../frontend/public/Images"
  );

const imageAliasMap = new Map([
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
    "/Images/download.jpg",
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
]);

const destinationImageMap = {
  faraya:
    "/Images/Faraya.jpg",

  batroun:
    "/Images/Batroun.jpg",

  byblos:
    "/Images/Batroun.jpg",

  baalbek:
    "/Images/52de2359f6d93ff4a4b06402d9c80bfbfdbb5463_1200x630.jpg",

  qadisha:
    "/Images/qadisha-kadisha-valley.jpg",

  saida:
    "/Images/Saida.jpg",

  sidon:
    "/Images/Saida.jpg",

  tyre:
    "/Images/Tyre-Beach-Lebanon.jpg",

  anfeh:
    "/Images/AnfehSeaEscape.jpg",

  chouf:
    "/Images/Lebanon-spring-1.jpg",

  bcharre:
    "/Images/download.avif",

  ehden:
    "/Images/E0ZceKeWYAc9XPV.jpg",

  jezzine:
    "/Images/68.jpg",

  laklouk:
    "/Images/Outdoor-Adventures-Lebanon_FT1_.webp",

  jeita:
    "/Images/download.jpg",

  cedars:
    "/Images/Outdoor-Adventures-Lebanon_FT1_.webp",

  beiteddine:
    "/Images/images (3).jpg",

  "deir el qamar":
    "/Images/images (4).jpg",

  beirut:
    "/Images/mosque-and-shops-in-the-medina-old-town-of-tripoli-libya-north-africa-BPMJ5G.jpg",
};

/*
|--------------------------------------------------------------------------
| Read actual images from frontend/public/Images
|--------------------------------------------------------------------------
*/

function readAvailableTripImages() {
  try {
    const entries =
      fs.readdirSync(
        publicImagesDirectory,
        {
          withFileTypes: true,
        }
      );

    const images =
      entries
        .filter(
          (entry) =>
            entry.isFile() &&
            /\.(avif|gif|jpe?g|png|webp)$/i.test(
              entry.name
            )
        )
        .map(
          (entry) =>
            `/Images/${entry.name}`
        )
        .sort(
          (first, second) =>
            first.localeCompare(
              second
            )
        );

    const hasDefaultImage =
      images.some(
        (image) =>
          image.toLowerCase() ===
          defaultTripImage.toLowerCase()
      );

    if (!hasDefaultImage) {
      images.push(
        defaultTripImage
      );
    }

    return images;
  } catch (error) {
    console.warn(
      "Could not read frontend/public/Images:",
      error.message
    );

    return [
      defaultTripImage,
    ];
  }
}

const availableTripImages =
  readAvailableTripImages();

const availableTripImageMap =
  new Map(
    availableTripImages.map(
      (image) => [
        image.toLowerCase(),
        image,
      ]
    )
  );

const nonDefaultTripImages =
  availableTripImages.filter(
    (image) =>
      image.toLowerCase() !==
      defaultTripImage.toLowerCase()
  );

/*
|--------------------------------------------------------------------------
| General helpers
|--------------------------------------------------------------------------
*/

function validId(id) {
  return mongoose.Types.ObjectId.isValid(
    id
  );
}

function hashString(value) {
  const text =
    String(value || "");

  let hash = 0;

  for (
    let index = 0;
    index < text.length;
    index += 1
  ) {
    hash =
      (
        hash * 31 +
        text.charCodeAt(index)
      ) >>> 0;
  }

  return hash;
}

/*
|--------------------------------------------------------------------------
| Duration helpers
|--------------------------------------------------------------------------
*/

function normalizeDurationValue(value) {
  const amount =
    readDurationAmount(
      value
    );

  if (amount === 0) {
    return 0;
  }

  const unit =
    normalizeDurationUnit(
      value
    );

  if (unit === "hours") {
    return Math.max(
      1,
      Math.ceil(
        amount / 24
      )
    );
  }

  return Math.max(
    1,
    Math.ceil(amount)
  );
}

function readDurationAmount(value) {
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
    return Math.max(
      0,
      value
    );
  }

  const numericValue =
    Number(value);

  if (
    Number.isFinite(
      numericValue
    )
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

    return Math.max(
      0,
      amount
    );
  }

  return 0;
}

function normalizeDurationUnit(
  value,
  fallbackUnit = "days"
) {
  const source =
    typeof value === "object" &&
    value !== null
      ? value.unit ??
        (value.hours !==
        undefined
          ? "hours"
          : fallbackUnit)
      : value ??
        fallbackUnit;

  return String(
    source || fallbackUnit
  )
    .trim()
    .toLowerCase() ===
    "hours"
    ? "hours"
    : "days";
}

function buildDurationField(
  value,
  fallbackUnit = "days"
) {
  const normalizedValue =
    readDurationAmount(
      value
    );

  return {
    value:
      normalizedValue,

    unit:
      normalizeDurationUnit(
        typeof value ===
          "object" &&
          value !== null
          ? value
          : fallbackUnit,
        fallbackUnit
      ),
  };
}

/*
|--------------------------------------------------------------------------
| Image helpers
|--------------------------------------------------------------------------
*/

function isRemoteImage(value) {
  return /^https?:\/\//i.test(
    String(
      value || ""
    ).trim()
  );
}

function normalizeImagePath(value) {
  const normalized =
    String(
      value || ""
    )
      .trim()
      .replace(
        /\\/g,
        "/"
      );

  if (!normalized) {
    return "";
  }

  /*
   * Keep complete external image URLs.
   */
  if (
    isRemoteImage(
      normalized
    )
  ) {
    return normalized;
  }

  const imagePath =
    normalized.startsWith("/")
      ? normalized.replace(
          /\/+/g,
          "/"
        )
      : `/${normalized}`.replace(
          /\/+/g,
          "/"
        );

  const lower =
    imagePath.toLowerCase();

  /*
   * Repair old image paths.
   */
  if (
    imageAliasMap.has(lower)
  ) {
    const alias =
      imageAliasMap.get(
        lower
      );

    return (
      availableTripImageMap.get(
        alias.toLowerCase()
      ) ||
      ""
    );
  }

  /*
   * Local path is accepted only when
   * the image exists in public/Images.
   */
  return (
    availableTripImageMap.get(
      lower
    ) ||
    ""
  );
}

/*
|--------------------------------------------------------------------------
| Find destination image
|--------------------------------------------------------------------------
*/

function getDestinationImage(
  ...values
) {
  const combined =
    values
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

  for (
    const [
      destination,
      image,
    ] of Object.entries(
      destinationImageMap
    )
  ) {
    if (
      combined.includes(
        destination
      )
    ) {
      const validImage =
        normalizeImagePath(
          image
        );

      if (validImage) {
        return validImage;
      }
    }
  }

  return "";
}

/*
|--------------------------------------------------------------------------
| Find an unused public image
|--------------------------------------------------------------------------
*/

function getUnusedPublicImage(
  seed,
  usedImages
) {
  if (
    nonDefaultTripImages.length ===
    0
  ) {
    return "";
  }

  const startIndex =
    hashString(
      seed
    ) %
    nonDefaultTripImages.length;

  for (
    let offset = 0;
    offset <
      nonDefaultTripImages.length;
    offset += 1
  ) {
    const image =
      nonDefaultTripImages[
        (
          startIndex +
          offset
        ) %
        nonDefaultTripImages.length
      ];

    if (
      !usedImages ||
      !usedImages.has(image)
    ) {
      return image;
    }
  }

  return "";
}

/*
|--------------------------------------------------------------------------
| Resolve the main image in the required order
|--------------------------------------------------------------------------
|
| 1. trip.photo
| 2. any trip.places image
| 3. destination image
| 4. another unused public image
| 5. Libanon233.jpg
|
*/

function resolveTripPhoto(
  trip,
  usedImages = null
) {
  /*
   * 1. Image saved in trip.photo.
   */
  const savedTripPhoto =
    normalizeImagePath(
      trip?.photo
    );

  if (savedTripPhoto) {
    usedImages?.add(
      savedTripPhoto
    );

    return savedTripPhoto;
  }

  /*
   * 2. Image saved in any place.
   */
  const places =
    Array.isArray(
      trip?.places
    )
      ? trip.places
      : [];

  for (
    const place of places
  ) {
    const savedPlaceImage =
      normalizeImagePath(
        place?.image
      );

    if (savedPlaceImage) {
      usedImages?.add(
        savedPlaceImage
      );

      return savedPlaceImage;
    }
  }

  /*
   * 3. Image matching the destination.
   */
  const destinationImage =
    getDestinationImage(
      trip?.to,
      trip?.title,
      trip?.country
    );

  if (
    destinationImage &&
    (
      !usedImages ||
      !usedImages.has(
        destinationImage
      )
    )
  ) {
    usedImages?.add(
      destinationImage
    );

    return destinationImage;
  }

  /*
   * 4. Another unused public image.
   */
  const unusedImage =
    getUnusedPublicImage(
      [
        trip?._id,
        trip?.title,
        trip?.to,
        trip?.country,
      ].join(" "),
      usedImages
    );

  if (unusedImage) {
    usedImages?.add(
      unusedImage
    );

    return unusedImage;
  }

  /*
   * 5. Final fallback.
   */
  return defaultTripImage;
}

/*
|--------------------------------------------------------------------------
| Resolve the trips-list image only
|--------------------------------------------------------------------------
|
| For the trips page, keep only a real
| unique stored image. If there is no
| unique valid local/remote image here,
| the frontend already falls back to:
|
| 1. a destination-based image path
| 2. Libanon233.jpg
|
*/

function resolveTripListPhoto(
  trip,
  usedImages
) {
  const savedTripPhoto =
    normalizeImagePath(
      trip?.photo
    );

  if (
    savedTripPhoto &&
    !usedImages.has(
      savedTripPhoto
    )
  ) {
    usedImages.add(
      savedTripPhoto
    );

    return savedTripPhoto;
  }

  const places =
    Array.isArray(
      trip?.places
    )
      ? trip.places
      : [];

  for (
    const place of places
  ) {
    const savedPlaceImage =
      normalizeImagePath(
        place?.image
      );

    if (
      savedPlaceImage &&
      !usedImages.has(
        savedPlaceImage
      )
    ) {
      usedImages.add(
        savedPlaceImage
      );

      return savedPlaceImage;
    }
  }

  return "";
}

/*
|--------------------------------------------------------------------------
| Resolve each place image
|--------------------------------------------------------------------------
*/

function resolvePlaceImage(
  place,
  trip
) {
  const savedPlaceImage =
    normalizeImagePath(
      place?.image
    );

  if (savedPlaceImage) {
    return savedPlaceImage;
  }

  const destinationImage =
    getDestinationImage(
      place?.city,
      trip?.to,
      trip?.title,
      trip?.country
    );

  if (destinationImage) {
    return destinationImage;
  }

  return (
    getUnusedPublicImage(
      [
        place?.city,
        trip?._id,
        trip?.title,
        trip?.to,
      ].join(" "),
      null
    ) ||
    defaultTripImage
  );
}

/*
|--------------------------------------------------------------------------
| Apply image fallbacks without changing other fields
|--------------------------------------------------------------------------
*/

function applyImagesOnly(trip) {
  const places =
    Array.isArray(
      trip?.places
    )
      ? trip.places.map(
          (place) => ({
            ...place,

            image:
              resolvePlaceImage(
                place,
                trip
              ),
          })
        )
      : [];

  return {
    ...trip,

    photo:
      resolveTripPhoto(
        trip
      ),

    places,
  };
}

/*
|--------------------------------------------------------------------------
| Existing normalization
|--------------------------------------------------------------------------
*/

function normalizePlace(
  place,
  trip
) {
  return {
    ...place,

    image:
      resolvePlaceImage(
        place,
        trip
      ),

    days:
      normalizeDurationValue(
        place?.days ??
        place?.duration
      ) ||
      1,
  };
}

/*
|--------------------------------------------------------------------------
| Save place data
|--------------------------------------------------------------------------
|
| Generated fallback images are not saved.
| Only the actual image submitted in place.image is saved.
|
*/

function normalizePlaceForPersistence(
  place
) {
  return {
    ...place,

    image:
      normalizeImagePath(
        place?.image
      ),

    duration:
      buildDurationField(
        place?.duration ??
        place?.days ??
        1
      ),
  };
}

function hasValidPlaceCoordinates(
  latitude,
  longitude
) {
  const lat =
    Number(latitude);
  const lng =
    Number(longitude);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    return false;
  }

  if (lat === 0 && lng === 0) {
    return false;
  }

  return (
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

async function normalizePlaceCoordinates(
  place
) {
  if (
    hasValidPlaceCoordinates(
      place?.latitude,
      place?.longitude
    )
  ) {
    return {
      ...place,
      latitude: Number(
        place.latitude
      ),
      longitude: Number(
        place.longitude
      ),
    };
  }

  const coordinates =
    await getCoordinates(
      place?.city
    );

  if (coordinates) {
    return {
      ...place,
      latitude:
        coordinates.lat,
      longitude:
        coordinates.lng,
    };
  }

  return {
    ...place,
    latitude: Number(
      place?.latitude
    ),
    longitude: Number(
      place?.longitude
    ),
  };
}

/*
|--------------------------------------------------------------------------
| Normalize trip returned by list/create/update
|--------------------------------------------------------------------------
*/

function normalizeTripResponse(
  trip,
  usedImages = null
) {
  return {
    ...trip,

    description:
      String(
        trip?.description ||
        ""
      ),

    photo: usedImages
      ? resolveTripListPhoto(
          trip,
          usedImages
        )
      : resolveTripPhoto(
          trip,
          usedImages
        ),

    duration:
      buildDurationField(
        trip?.duration ??
          1
      ) ||
      buildDurationField(1),

    price:
      Number(
        trip?.price ||
        0
      ),

    rating:
      Number(
        trip?.rating ||
        0
      ),

    numberOfTravelers:
      Number(
        trip?.numberOfTravelers ||
        0
      ),

    reservedTravelers:
      Number(
        trip?.reservedTravelers ||
        0
      ),

    inclusions:
      Array.isArray(
        trip?.inclusions
      )
        ? trip.inclusions
        : [],

    places:
      Array.isArray(
        trip?.places
      )
        ? trip.places.map(
            (place) =>
              normalizePlace(
                place,
                trip
              )
          )
        : [],
  };
}

/*
|--------------------------------------------------------------------------
| Normalize data saved to MongoDB
|--------------------------------------------------------------------------
|
| A generated fallback is not saved into MongoDB.
| This keeps the fallback order working every time trips are displayed.
|
*/

async function normalizeTripForPersistence(
  trip
) {
  return {
    ...trip,

    photo:
      normalizeImagePath(
        trip?.photo
      ),

    duration:
      buildDurationField(
        trip?.duration
      ),

    places:
      Array.isArray(
        trip?.places
      )
        ? await Promise.all(
            trip.places.map(
              async (place) =>
                normalizePlaceCoordinates(
                  normalizePlaceForPersistence(
                    place
                  )
                )
            )
          )
        : [],
  };
}

/*
|--------------------------------------------------------------------------
| Input helpers
|--------------------------------------------------------------------------
*/

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
      normalized.status
        .toLowerCase();
  }

  if (
    normalized.transportation
  ) {
    normalized.transportation =
      normalized.transportation
        .toLowerCase();
  }

  if (
    normalized.tripType
  ) {
    normalized.tripType =
      normalized.tripType
        .toLowerCase();
  }

  const numericFields = [
    "price",
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

  if (
    normalized.date
  ) {
    normalized.date =
      new Date(
        normalized.date
      );
  }

  if (
    normalized.duration !==
      undefined &&
    normalized.duration !==
      ""
  ) {
    normalized.duration =
      buildDurationField(
        normalized.duration
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
      data.photo ||
      "",

    price:
      data.price ??
      0,

    duration:
      buildDurationField(
        data.duration ??
          0
      ),

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
      data.rating ??
      0,

    inclusions:
      Array.isArray(
        data.inclusions
      )
        ? data.inclusions
        : [],

    places:
      Array.isArray(
        data.places
      )
        ? data.places
        : [],
  };
}

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

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
        data[field] ||
        ""
      ).trim()
    ) {
      return `${field} is required.`;
    }
  }

  const date =
    new Date(
      data.date
    );

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
      data.duration?.value
    ) ||
    data.duration.value <
      0
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

/*
|--------------------------------------------------------------------------
| GET all trips
| GET /api/trips
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  async (
    _req,
    res,
    next
  ) => {
    try {
      await Trip.updateMany(
  {
    status: { $ne: "completed" },
    date: { $lt: new Date() },
  },
  {
    $set: {
      status: "completed",
    },
  }
);
      const trips =
        await Trip.find({})
          .sort({
            date: 1,
          })
          .lean();

      /*
       * Tracks the images already used
       * while building this response.
       */
      const usedImages =
        new Set();

      const normalizedTrips =
        trips.map(
          (trip) =>
            normalizeTripResponse(
              trip,
              usedImages
            )
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
      return next(error);
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET one trip and weather
| GET /api/trips/:id
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| GET one trip and weather
| GET /api/trips/:id
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  async (req, res) => {
    try {
      /*
       * Automatically mark old trips as completed.
       */
      await Trip.updateMany(
        {
          status: {
            $ne: "completed",
          },
          date: {
            $lt: new Date(),
          },
        },
        {
          $set: {
            status: "completed",
          },
        }
      );

      /*
       * Validate MongoDB ID.
       */
      if (
        !mongoose.Types.ObjectId.isValid(
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

      /*
       * Find the trip.
       */
      const trip =
        await Trip.findById(
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

      const MILLISECONDS_PER_DAY =
        24 * 60 * 60 * 1000;

      const WEATHER_WINDOW_DAYS =
        7;

      /*
       * Convert a date to midnight UTC.
       * This avoids differences between
       * the local computer and Render.
       */
      function toUtcMidnight(
        value
      ) {
        const date =
          new Date(value);

        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          return null;
        }

        return new Date(
          Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate()
          )
        );
      }

      /*
       * Add days without modifying
       * the original date.
       */
      function addUtcDays(
        value,
        numberOfDays
      ) {
        const result =
          new Date(value);

        result.setUTCDate(
          result.getUTCDate() +
            numberOfDays
        );

        return result;
      }

      /*
       * Convert a date to YYYY-MM-DD.
       */
      function formatWeatherDate(
        value
      ) {
        return new Date(value)
          .toISOString()
          .slice(0, 10);
      }

      /*
       * Validate and normalize coordinates.
       */
      function readCoordinates(
        latitude,
        longitude
      ) {
        const lat =
          Number(latitude);

        const lng =
          Number(longitude);

        if (
          !Number.isFinite(lat) ||
          !Number.isFinite(lng) ||
          lat < -90 ||
          lat > 90 ||
          lng < -180 ||
          lng > 180 ||
          (
            lat === 0 &&
            lng === 0
          )
        ) {
          return null;
        }

        return {
          latitude: lat,
          longitude: lng,
        };
      }

      /*
       * Use stored coordinates first.
       * When missing, search using city name.
       */
      async function resolveCoordinates(
        place
      ) {
        const storedCoordinates =
          readCoordinates(
            place?.latitude,
            place?.longitude
          );

        if (storedCoordinates) {
          return storedCoordinates;
        }

        const city =
          String(
            place?.city || ""
          ).trim();

        if (!city) {
          return null;
        }

        try {
          const geocodedCoordinates =
            await getCoordinates(
              city
            );

          return readCoordinates(
            geocodedCoordinates?.lat ??
              geocodedCoordinates
                ?.latitude,

            geocodedCoordinates?.lng ??
              geocodedCoordinates
                ?.longitude
          );
        } catch (
          geocodingError
        ) {
          console.error(
            "Weather geocoding error:",
            city,
            geocodingError.message
          );

          return null;
        }
      }

      const todayAtMidnight =
        toUtcMidnight(
          new Date()
        );

      const tripDateAtMidnight =
        toUtcMidnight(
          trip.date
        );

      if (
        !todayAtMidnight ||
        !tripDateAtMidnight
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid trip date.",
          });
      }

      const daysUntilTrip =
        Math.round(
          (
            tripDateAtMidnight.getTime() -
            todayAtMidnight.getTime()
          ) /
            MILLISECONDS_PER_DAY
        );

      const tripResponse =
        applyImagesOnly(
          trip.toObject()
        );

      /*
       * Past trip.
       */
      if (daysUntilTrip < 0) {
        return res
          .status(200)
          .json({
            success: true,

            trip:
              tripResponse,

            weather: {
              message:
                "Weather forecast is unavailable because this trip has already passed.",
            },
          });
      }

      /*
       * More than seven days away.
       */
      if (
        daysUntilTrip >
        WEATHER_WINDOW_DAYS
      ) {
        return res
          .status(200)
          .json({
            success: true,

            trip:
              tripResponse,

            weather: {
              message:
                `Weather forecast will be available ${WEATHER_WINDOW_DAYS} days before your trip.`,
            },
          });
      }

      const places =
        Array.isArray(
          trip.places
        )
          ? trip.places
          : [];

      /*
       * Trip has no destinations.
       */
      if (places.length === 0) {
        return res
          .status(200)
          .json({
            success: true,

            trip:
              tripResponse,

            weather: {
              message:
                "No destinations were added to this trip.",
            },
          });
      }

      let accumulatedDays = 0;

      const weatherResults = [];

      /*
       * Process each trip destination.
       */
      for (
        let index = 0;
        index < places.length;
        index += 1
      ) {
        const place =
          places[index];

        const city =
          String(
            place?.city ||
              `Destination ${index + 1}`
          ).trim();

        /*
         * Your existing helper converts hours
         * and days to a usable day count.
         */
        const durationDays =
          Math.max(
            1,
            normalizeDurationValue(
              place?.duration ??
                place?.days ??
                1
            )
          );

        const cityStartDate =
          addUtcDays(
            tripDateAtMidnight,
            accumulatedDays
          );

        const cityEndDate =
          addUtcDays(
            cityStartDate,
            durationDays - 1
          );

        accumulatedDays +=
          durationDays;

        const startDate =
          formatWeatherDate(
            cityStartDate
          );

        const endDate =
          formatWeatherDate(
            cityEndDate
          );

        /*
         * Get valid coordinates.
         */
        const coordinates =
          await resolveCoordinates(
            place
          );

        if (!coordinates) {
          console.error(
            "Weather coordinates unavailable:",
            city,
            place?.latitude,
            place?.longitude
          );

          weatherResults.push({
            city,
            forecast: [],
            message:
              "Destination coordinates are unavailable.",
          });

          continue;
        }

        try {
          /*
           * Retrieve the available forecast
           * and select the required trip dates.
           */
          const response =
            await axios.get(
              "https://api.open-meteo.com/v1/forecast",
              {
                params: {
                  latitude:
                    coordinates.latitude,

                  longitude:
                    coordinates.longitude,

                  daily:
                    "temperature_2m_max,temperature_2m_min",

                  timezone:
                    "auto",

                  forecast_days:
                    WEATHER_WINDOW_DAYS +
                    1,
                },

                timeout:
                  15000,

                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          const daily =
            response.data?.daily;

          if (
            !daily ||
            !Array.isArray(
              daily.time
            ) ||
            !Array.isArray(
              daily
                .temperature_2m_max
            ) ||
            !Array.isArray(
              daily
                .temperature_2m_min
            )
          ) {
            throw new Error(
              "Open-Meteo returned an invalid response."
            );
          }

          let forecast =
            daily.time
              .map(
                (
                  date,
                  weatherIndex
                ) => {
                  const maxTemp =
                    Number(
                      daily
                        .temperature_2m_max[
                        weatherIndex
                      ]
                    );

                  const minTemp =
                    Number(
                      daily
                        .temperature_2m_min[
                        weatherIndex
                      ]
                    );

                  return {
                    date,
                    maxTemp,
                    minTemp,
                  };
                }
              )
              .filter(
                (weatherDay) =>
                  weatherDay.date >=
                    startDate &&
                  weatherDay.date <=
                    endDate &&
                  Number.isFinite(
                    weatherDay.maxTemp
                  ) &&
                  Number.isFinite(
                    weatherDay.minTemp
                  )
              );

          /*
           * No forecast returned.
           */
          if (
            forecast.length === 0
          ) {
            console.error(
              "No weather forecast returned:",
              city,
              startDate,
              endDate
            );

            weatherResults.push({
              city,
              forecast: [],
              message:
                "No forecast is available for this destination date yet.",
            });

            continue;
          }

          console.log(
            "Weather success:",
            city,
            forecast
          );

          weatherResults.push({
            city,
            forecast,
            message: "",
          });
        } catch (
          weatherError
        ) {
          const providerError =
            weatherError
              .response
              ?.data ||
            weatherError.message;

          console.error(
            "Weather error:",
            city,
            providerError
          );

          weatherResults.push({
            city,
            forecast: [],
            message:
              "The weather service is temporarily unavailable.",
          });
        }
      }

      /*
       * Check whether at least one city
       * contains actual weather data.
       */
      const hasForecast =
        weatherResults.some(
          (entry) =>
            Array.isArray(
              entry.forecast
            ) &&
            entry.forecast.length >
              0
        );

      /*
       * Your current frontend displays a
       * message object. This prevents the
       * weather section from appearing blank
       * when every API request fails.
       */
      const weatherResponse =
        hasForecast
          ? weatherResults
          : {
              message:
                weatherResults.find(
                  (entry) =>
                    entry.message
                )?.message ||
                "Weather forecast is temporarily unavailable.",
            };

      return res
        .status(200)
        .json({
          success: true,

          trip:
            tripResponse,

          weather:
            weatherResponse,
        });
    } catch (error) {
      console.error(
        "Trip weather route error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Server error while loading the trip.",

          error:
            error.message,
        });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Create trip
| POST /api/trips
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  requireAuth,
  requireOrganizer,
  async (
    req,
    res,
    next
  ) => {
    try {
      let tripData =
        getAllowedFields(
          req.body
        );

      tripData =
        normalizeTripData(
          tripData
        );

      tripData =
        addDefaults(
          tripData
        );

      const validationError =
        validateTrip(
          tripData
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

      const trip =
        await Trip.create(
          await normalizeTripForPersistence(
            tripData
          )
        );

      return res
        .status(201)
        .json({
          success: true,

          message:
            "Trip created successfully.",

          trip:
            normalizeTripResponse(
              trip.toObject()
            ),
        });
    } catch (error) {
      return next(error);
    }
  }
);

/*
|--------------------------------------------------------------------------
| Update trip
| PUT /api/trips/:id
|--------------------------------------------------------------------------
*/

router.put(
  "/:id",
  requireAuth,
  requireOrganizer,
  async (
    req,
    res,
    next
  ) => {
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

      const existingData =
        existingTrip.toObject();

      /*
       * Preserve the real stored image
       * values when the update does not
       * include image fields.
       */
      const completeData =
        addDefaults({
          ...normalizeTripResponse(
            existingData
          ),

          photo:
            normalizeImagePath(
              existingData.photo
            ),

          places:
            Array.isArray(
              existingData.places
            )
              ? existingData.places
              : [],

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

      Object.assign(
        existingTrip,
        await normalizeTripForPersistence(
          completeData
        )
      );

      await existingTrip.save();

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Trip updated successfully.",

          trip:
            normalizeTripResponse(
              existingTrip.toObject()
            ),
        });
    } catch (error) {
      return next(error);
    }
  }
);

/*
|--------------------------------------------------------------------------
| Delete trip
| DELETE /api/trips/:id
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  requireAuth,
  requireOrganizer,
  async (
    req,
    res,
    next
  ) => {
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
      return next(error);
    }
  }
);

module.exports = router;
