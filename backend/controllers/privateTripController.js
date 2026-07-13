const mongoose = require("mongoose");

const PrivateTripRequest = require(
  "../models/PrivateTripRequest"
);

/*
|--------------------------------------------------------------------------
| Get current client's private trips
|--------------------------------------------------------------------------
*/

async function getPrivateTrips(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const trips =
      await PrivateTripRequest.find({
        client: req.user._id,
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      count: trips.length,
      trips,
    });
  } catch (error) {
    console.error(
      "Get private trips error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      error:
        "Could not fetch private trips",
    });
  }
}

/*
|--------------------------------------------------------------------------
| Create private trip
|--------------------------------------------------------------------------
*/

async function createPrivateTrip(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const trip =
      await PrivateTripRequest.create({
        ...req.body,
        client: req.user._id,
      });

    return res.status(201).json({
      success: true,
      message:
        "Private trip request created successfully",
      trip,
    });
  } catch (error) {
    console.error(
      "Create private trip error:",
      error.message
    );

    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error:
        "Could not create private trip",
    });
  }
}

/*
|--------------------------------------------------------------------------
| Delete current client's private trip
|--------------------------------------------------------------------------
*/

async function deletePrivateTrip(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid private trip ID",
      });
    }

    const trip =
      await PrivateTripRequest.findOneAndDelete(
        {
          _id: id,
          client: req.user._id,
        }
      );

    if (!trip) {
      return res.status(404).json({
        success: false,
        error:
          "Private trip not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Private trip deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete private trip error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      error:
        "Could not delete private trip",
    });
  }
}

module.exports = {
  getPrivateTrips,
  createPrivateTrip,
  deletePrivateTrip,
};