const express = require("express");

const {
  getTrips,
  createTrip,
  updateTrip,
  deleteTrip,
} = require("../controllers/tripController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getTrips);
router.post("/", protect, adminOnly, createTrip);
router.put("/:id", protect, adminOnly, updateTrip);
router.delete("/:id", protect, adminOnly, deleteTrip);

module.exports = router;