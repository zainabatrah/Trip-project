const Trip = require("../models/Trip");

async function getTrips(req, res) {
  try {
    const trips = await Trip.find().sort({ createdAt: -1 });
    return res.json(trips);
  } catch (error) {
    console.error("Get trips error:", error.message);
    return res.status(500).json({ error: "Could not fetch trips" });
  }
}

async function createTrip(req, res) {
  try {
    const trip = await Trip.create(req.body);
    return res.status(201).json(trip);
  } catch (error) {
    console.error("Create trip error:", error.message);
    return res.status(500).json({ error: "Could not create trip" });
  }
}

async function updateTrip(req, res) {
  try {
    const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    return res.json(trip);
  } catch (error) {
    console.error("Update trip error:", error.message);
    return res.status(500).json({ error: "Could not update trip" });
  }
}

async function deleteTrip(req, res) {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    return res.json({ message: "Trip deleted" });
  } catch (error) {
    console.error("Delete trip error:", error.message);
    return res.status(500).json({ error: "Could not delete trip" });
  }
}

module.exports = {
  getTrips,
  createTrip,
  updateTrip,
  deleteTrip,
};