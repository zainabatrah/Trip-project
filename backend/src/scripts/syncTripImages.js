const fs = require("fs");
const path = require("path");

require("dotenv").config({
  path: path.resolve(
    __dirname,
    "../../.env"
  ),
});

const mongoose = require("mongoose");

const connectDB = require("../../db");
const Trip = require("../../models/Trip");
const {
  canonicalImageFiles,
  defaultTripImage,
  getDestinationPreset,
} = require("../config/tripImages");

const publicImagesDirectory =
  path.resolve(
    __dirname,
    "../../../frontend/public/Images"
  );

function toPublicImageFilePath(
  imagePath
) {
  const relativePath = String(
    imagePath || ""
  ).replace(/^\/Images\//i, "");

  return path.join(
    publicImagesDirectory,
    relativePath
  );
}

function normalizeImagePath(
  value
) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function getCanonicalImage(
  value
) {
  return (
    getDestinationPreset(value)
      ?.image ||
    defaultTripImage
  );
}

function ensureCanonicalImageFiles() {
  const createdFiles = [];
  const missingSources = [];

  for (const file of canonicalImageFiles) {
    const sourcePath =
      toPublicImageFilePath(
        file.source
      );
    const targetPath =
      toPublicImageFilePath(
        file.target
      );

    if (
      !fs.existsSync(
        sourcePath
      )
    ) {
      missingSources.push(
        file.source
      );
      continue;
    }

    if (
      fs.existsSync(
        targetPath
      )
    ) {
      continue;
    }

    fs.copyFileSync(
      sourcePath,
      targetPath
    );

    createdFiles.push(
      file.target
    );
  }

  return {
    createdFiles,
    missingSources,
  };
}

async function syncTrips() {
  const {
    createdFiles,
    missingSources,
  } = ensureCanonicalImageFiles();

  await connectDB();

  const trips =
    await Trip.find({});
  let updatedTrips = 0;

  for (const trip of trips) {
    let changed = false;

    const nextPhoto =
      getCanonicalImage(
        trip.to
      );

    if (
      normalizeImagePath(
        trip.photo
      ) !==
      normalizeImagePath(
        nextPhoto
      )
    ) {
      trip.photo = nextPhoto;
      changed = true;
    }

    if (
      Array.isArray(
        trip.places
      )
    ) {
      for (const place of trip.places) {
        const nextPlaceImage =
          getCanonicalImage(
            place?.city
          );

        if (
          normalizeImagePath(
            place?.image
          ) !==
          normalizeImagePath(
            nextPlaceImage
          )
        ) {
          place.image =
            nextPlaceImage;
          changed = true;
        }
      }
    }

    if (!changed) {
      continue;
    }

    await trip.save();
    updatedTrips += 1;
  }

  return {
    createdFiles,
    missingSources,
    updatedTrips,
    totalTrips:
      trips.length,
  };
}

async function main() {
  try {
    const result =
      await syncTrips();

    console.log(
      JSON.stringify(
        result,
        null,
        2
      )
    );
  } catch (error) {
    console.error(
      "Trip image sync failed."
    );
    console.error(error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();