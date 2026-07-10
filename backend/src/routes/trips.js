import express from "express";
import mongoose from "mongoose";
import Trip from "../models/Trip.js";

const router = express.Router();

// GET all trips
router.get("/", async (req, res) => {
  try {
    const trips = await Trip.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: trips.length,
      trips,
    });
  } catch (error) {
    console.error("GET /api/trips error:", error);

    res.status(500).json({
      success: false,
      message: "Could not load trips.",
      error: error.message,
    });
  }
});

// GET one trip
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID.",
      });
    }

    const trip = await Trip.findById(id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }

    res.status(200).json({
      success: true,
      trip,
    });
  } catch (error) {
    console.error("GET /api/trips/:id error:", error);

    res.status(500).json({
      success: false,
      message: "Could not load trip.",
      error: error.message,
    });
  }
});

// CREATE trip
router.post("/", async (req, res) => {
  try {
    const trip = await Trip.create(req.body);

    res.status(201).json({
      success: true,
      message: "Trip created successfully.",
      trip,
    });
  } catch (error) {
    console.error("POST /api/trips error:", error);

    res.status(400).json({
      success: false,
      message: "Could not create trip.",
      error: error.message,
    });
  }
});

// UPDATE trip
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID.",
      });
    }

    const trip = await Trip.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Trip updated successfully.",
      trip,
    });
  } catch (error) {
    console.error("PUT /api/trips/:id error:", error);

    res.status(400).json({
      success: false,
      message: "Could not update trip.",
      error: error.message,
    });
  }
});

// DELETE trip
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID.",
      });
    }

    const trip = await Trip.findByIdAndDelete(id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Trip deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE /api/trips/:id error:", error);

    res.status(500).json({
      success: false,
      message: "Could not delete trip.",
      error: error.message,
    });
  }
});

export default router;

