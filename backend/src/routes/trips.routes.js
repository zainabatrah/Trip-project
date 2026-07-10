import express from "express";
import Trip from "../models/Trip.js";

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const trips = await Trip.find({}).sort({ createdAt: -1 }).lean();

    res.json({
      trips,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id).lean();

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found.",
      });
    }

    res.json({
      trip,
    });
  } catch (error) {
    next(error);
  }
});

export default router;