const PrivateTrip = require("../models/PrivateTrip");

async function getPrivateTrips(req, res) {
  try {
    const trips = await PrivateTrip.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    return res.json(trips);
  } catch (error) {
    console.error("Get private trips error:", error.message);
    return res.status(500).json({ error: "Could not fetch private trips" });
  }
}

async function createPrivateTrip(req, res) {
  try {
    const trip = await PrivateTrip.create({
      ...req.body,
      user: req.user._id,
    });

    return res.status(201).json(trip);
  } catch (error) {
    console.error("Create private trip error:", error.message);
    return res.status(500).json({ error: "Could not create private trip" });
  }
}

async function deletePrivateTrip(req, res) {
  try {
    const trip = await PrivateTrip.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({ error: "Private trip not found" });
    }

    return res.json({ message: "Private trip deleted" });
  } catch (error) {
    console.error("Delete private trip error:", error.message);
    return res.status(500).json({ error: "Could not delete private trip" });
  }
}

module.exports = {
  getPrivateTrips,
  createPrivateTrip,
  deletePrivateTrip,
};