const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const Feedback = require("../models/Feedback");



/* GET FEEDBACK OF A TRIP */

router.get("/:tripId", async (req, res) => {
  try {
    const feedback = await Feedback.find({
      trip: req.params.tripId,
    })
      .populate("user", "fullName")
      .sort({ createdAt: -1 });

    res.json(feedback);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});
const Trip = require("../models/Trip");

router.post("/", requireAuth, async (req, res) => {
  try {
    const { trip, rating, comment } = req.body;

    const feedback = await Feedback.create({
      trip,
      user: req.user._id,
      rating,
      comment,
    });

    // Calculate average rating
    const ratings = await Feedback.find({
      trip,
    });

    const averageRating =
      ratings.reduce(
        (sum, item) => sum + item.rating,
        0
      ) / ratings.length;

    // Update trip rating
    await Trip.findByIdAndUpdate(trip, {
      rating: Number(averageRating.toFixed(1)),
    });

    const populatedFeedback =
      await Feedback.findById(feedback._id)
        .populate("user", "fullName");

    res.status(201).json(populatedFeedback);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;