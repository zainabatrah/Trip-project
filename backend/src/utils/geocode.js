const axios = require("axios");

async function getCoordinates(place) {
  try {
    const response = await axios.get(
  "https://nominatim.openstreetmap.org/search",
  {
    params: {
      q: `${place}, Lebanon`,
      format: "json",
      limit: 1,
      countrycodes: "lb",
    },
    headers: {
      "User-Agent": "TripManagementSystem",
    },
  }
);

    if (response.data.length === 0) {
      return null;
    }

    return {
      lat: Number(response.data[0].lat),
      lng: Number(response.data[0].lon),
    };

  } catch (error) {
    console.log(
      "Geocoding error:",
      error.message
    );

    return null;
  }
}

module.exports = getCoordinates;