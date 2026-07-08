const express = require("express");
const Trip = require("../models/Trips");
const axios = require("axios");
const mongoose = require("mongoose");
const router = express.Router();

// search for trip 

router.get("/:id", async (req, res) => {
  try {

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const weatherPromises = trip.places.map(async (place) => {

      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
      );

      const daily = response.data.daily;

      const forecast = daily.time.map((date, index) => ({
        date,
        maxTemp: daily.temperature_2m_max[index],
        minTemp: daily.temperature_2m_min[index]
      }));

      return {
        city: place.city,
        days: place.days,
        forecast: forecast.slice(0, place.days)
      };

    });

    const weather = await Promise.all(weatherPromises);


    res.json({
      trip,
      weather
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
});

module.exports = router;