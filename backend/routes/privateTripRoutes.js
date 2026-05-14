const express = require("express");

const {
  getPrivateTrips,
  createPrivateTrip,
  deletePrivateTrip,
} = require("../controllers/privateTripController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getPrivateTrips);
router.post("/", protect, createPrivateTrip);
router.delete("/:id", protect, deletePrivateTrip);

module.exports = router;
