import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getTripById,
} from "../api/trips.js";

import DashboardLayout from "../components/DashboardLayout.jsx";

import "./tripdetail.css";

import {
  FaBus,
  FaCar,
  FaShip,
  FaHourglassHalf,
  FaPlayCircle,
  FaTimesCircle,
  FaUtensils,
  FaHotel,
  FaMapMarkedAlt,
  FaStar,
  FaMapMarkerAlt,
  FaUsers,
  FaClock,
  FaPlane,
  FaCheckCircle,
} from "react-icons/fa";

/*
|--------------------------------------------------------------------------
| Final browser fallback
|--------------------------------------------------------------------------
*/

const defaultTripImage =
  "/Images/Libanon233.jpg";

/*
|--------------------------------------------------------------------------
| Main trip image
|--------------------------------------------------------------------------
|
| The backend already resolves images in this order:
|
| 1. trip.photo
| 2. an image from trip.places
| 3. destination image
| 4. unused frontend/public/Images image
| 5. Libanon233.jpg
|
| This helper provides an additional frontend safety check.
|
*/

function getTripDisplayImage(
  trip
) {
  const tripPhoto =
    String(
      trip?.photo || ""
    ).trim();

  if (tripPhoto) {
    return tripPhoto;
  }

  const places =
    Array.isArray(
      trip?.places
    )
      ? trip.places
      : [];

  const placeImage =
    places
      .map(
        (place) =>
          String(
            place?.image || ""
          ).trim()
      )
      .find(Boolean);

  return (
    placeImage ||
    defaultTripImage
  );
}

/*
|--------------------------------------------------------------------------
| Place image
|--------------------------------------------------------------------------
*/

function getPlaceDisplayImage(
  place,
  trip
) {
  const placeImage =
    String(
      place?.image || ""
    ).trim();

  if (placeImage) {
    return placeImage;
  }

  const tripImage =
    String(
      trip?.photo || ""
    ).trim();

  return (
    tripImage ||
    defaultTripImage
  );
}

/*
|--------------------------------------------------------------------------
| Request error messages
|--------------------------------------------------------------------------
*/

function getErrorMessage(
  error
) {
  if (
    error?.status === 400 ||
    error?.status === 404
  ) {
    return "Trip not found.";
  }

  if (
    error?.status === 401
  ) {
    return "Please log in to view this trip.";
  }

  if (
    error?.status === 403
  ) {
    return "You are not allowed to view this trip.";
  }

  if (
    error?.status >= 500
  ) {
    return "Server error. Please try again.";
  }

  return (
    error?.message ||
    "Failed to load trip data."
  );
}

/*
|--------------------------------------------------------------------------
| Duration formatting
|--------------------------------------------------------------------------
*/

function getDurationData(
  value,
  fallbackUnit = "days"
) {
  if (
    value &&
    typeof value ===
      "object"
  ) {
    const durationValue =
      value.value ??
      value.amount ??
      value.days ??
      value.hours;

    if (
      durationValue !==
        undefined &&
      durationValue !==
        null &&
      durationValue !==
        ""
    ) {
      return {
        value:
          durationValue,

        unit:
          String(
            value.unit ||
              fallbackUnit
          ).trim() ||
          fallbackUnit,
      };
    }
  }

  if (
    value !== undefined &&
    value !== null &&
    value !== ""
  ) {
    return {
      value,
      unit:
        fallbackUnit,
    };
  }

  return {
    value: 0,
    unit:
      fallbackUnit,
  };
}

/*
|--------------------------------------------------------------------------
| Trip Details
|--------------------------------------------------------------------------
*/

export default function TripDetails() {
  const {
    id,
  } = useParams();

  const [
    trip,
    setTrip,
  ] = useState(null);

  const [
    forecast,
    setForecast,
  ] = useState([]);

  const [
    weatherMessage,
    setWeatherMessage,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /*
   * The verified image used by
   * the hero background.
   */
  const [
    heroImage,
    setHeroImage,
  ] = useState(
    defaultTripImage
  );

  const navigate =
    useNavigate();

  /*
  |--------------------------------------------------------------------------
  | Load trip
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled =
      false;

    async function fetchTrip() {
      if (!id) {
        setTrip(null);
        setForecast([]);
        setWeatherMessage("");
        setError(
          "Trip not found."
        );
        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setError("");

        const data =
          await getTripById(
            id
          );

        if (cancelled) {
          return;
        }

        if (!data?.trip) {
          setTrip(null);
          setForecast([]);
          setWeatherMessage("");
          setError(
            "Trip not found."
          );

          return;
        }

        setTrip(
          data.trip
        );

        if (
          Array.isArray(
            data.weather
          )
        ) {
          setForecast(
            data.weather
          );

          setWeatherMessage(
            ""
          );
        } else if (
          data.weather &&
          typeof data.weather ===
            "object" &&
          data.weather.message
        ) {
          setWeatherMessage(
            data.weather
              .message
          );

          setForecast([]);
        } else {
          setForecast([]);
          setWeatherMessage(
            ""
          );
        }
      } catch (
        requestError
      ) {
        if (cancelled) {
          return;
        }

        setTrip(null);
        setForecast([]);
        setWeatherMessage(
          ""
        );

        setError(
          getErrorMessage(
            requestError
          )
        );
      } finally {
        if (!cancelled) {
          setLoading(
            false
          );
        }
      }
    }

    fetchTrip();

    return () => {
      cancelled =
        true;
    };
  }, [id]);

  /*
  |--------------------------------------------------------------------------
  | Verify hero image
  |--------------------------------------------------------------------------
  |
  | A CSS background does not provide an onError event.
  | Therefore, the image is tested before being assigned.
  |
  */

  useEffect(() => {
    if (!trip) {
      setHeroImage(
        defaultTripImage
      );

      return undefined;
    }

    let cancelled =
      false;

    const selectedImage =
      getTripDisplayImage(
        trip
      );

    /*
     * Show the default while checking
     * the selected image.
     */
    setHeroImage(
      defaultTripImage
    );

    const imageLoader =
      new window.Image();

    imageLoader.onload =
      () => {
        if (!cancelled) {
          setHeroImage(
            selectedImage
          );
        }
      };

    imageLoader.onerror =
      () => {
        if (!cancelled) {
          setHeroImage(
            defaultTripImage
          );
        }
      };

    imageLoader.src =
      selectedImage;

    return () => {
      cancelled =
        true;

      imageLoader.onload =
        null;

      imageLoader.onerror =
        null;
    };
  }, [trip]);

  if (loading) {
    return (
      <h2>
        Loading...
      </h2>
    );
  }

  if (error) {
    return (
      <h2>
        {error}
      </h2>
    );
  }

  if (!trip) {
    return (
      <h2>
        Trip not found.
      </h2>
    );
  }

  console.log(trip);

  /*
  |--------------------------------------------------------------------------
  | Weather icon
  |--------------------------------------------------------------------------
  */

  const getWeatherIcon =
    (temp) => {
      if (temp >= 38) {
        return (
          <span className="weather-main-icon">
            🔥
          </span>
        );
      }

      if (temp >= 32) {
        return (
          <span className="weather-main-icon">
            🥵
          </span>
        );
      }

      if (temp >= 27) {
        return (
          <span className="weather-main-icon">
            ☀️
          </span>
        );
      }

      if (temp >= 23) {
        return (
          <span className="weather-main-icon">
            🌤️
          </span>
        );
      }

      if (temp >= 18) {
        return (
          <span className="weather-main-icon">
            ⛅
          </span>
        );
      }

      if (temp >= 15) {
        return (
          <span className="weather-main-icon">
            ☁️
          </span>
        );
      }

      if (temp >= 12) {
        return (
          <span className="weather-main-icon">
            🌦️
          </span>
        );
      }

      if (temp >= 9) {
        return (
          <span className="weather-main-icon">
            🌧️
          </span>
        );
      }

      if (temp >= 6) {
        return (
          <span className="weather-main-icon">
            ⛈️
          </span>
        );
      }

      if (temp >= 3) {
        return (
          <span className="weather-main-icon">
            🌨️
          </span>
        );
      }

      if (temp >= -5) {
        return (
          <span className="weather-main-icon">
            ❄️
          </span>
        );
      }

      return (
        <span className="weather-main-icon">
          🥶
        </span>
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Status icon
  |--------------------------------------------------------------------------
  */

  const getStatusIcon =
    (status) => {
      const normalizedStatus =
        String(
          status || ""
        ).toLowerCase();

      if (
        normalizedStatus ===
        "completed"
      ) {
        return (
          <FaCheckCircle
            color="green"
          />
        );
      }

      if (
        normalizedStatus ===
        "ongoing"
      ) {
        return (
          <FaPlayCircle
            color="orange"
          />
        );
      }

      if (
        normalizedStatus ===
        "planned"
      ) {
        return (
          <FaHourglassHalf
            color="blue"
          />
        );
      }

      return (
        <FaTimesCircle
          color="red"
        />
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Transportation icon
  |--------------------------------------------------------------------------
  */

  const getTransportIcon =
    (type) => {
      const normalizedType =
        type?.toLowerCase();

      if (
        normalizedType?.includes(
          "flight"
        ) ||
        normalizedType?.includes(
          "plane"
        )
      ) {
        return <FaPlane />;
      }

      if (
        normalizedType?.includes(
          "bus"
        )
      ) {
        return <FaBus />;
      }

      if (
        normalizedType?.includes(
          "car"
        )
      ) {
        return <FaCar />;
      }

      if (
        normalizedType?.includes(
          "ship"
        ) ||
        normalizedType?.includes(
          "boat"
        )
      ) {
        return <FaShip />;
      }

      return <FaPlane />;
    };

  /*
  |--------------------------------------------------------------------------
  | Inclusion icon
  |--------------------------------------------------------------------------
  */

  const getInclusionIcon =
    (item) => {
      const text =
        String(
          item || ""
        ).toLowerCase();

      if (
        text.includes(
          "food"
        ) ||
        text.includes(
          "meal"
        )
      ) {
        return (
          <FaUtensils
            color="orange"
          />
        );
      }

      if (
        text.includes(
          "hotel"
        ) ||
        text.includes(
          "stay"
        )
      ) {
        return (
          <FaHotel
            color="purple"
          />
        );
      }

      if (
        text.includes(
          "transport"
        ) ||
        text.includes(
          "bus"
        ) ||
        text.includes(
          "flight"
        )
      ) {
        return (
          <FaBus
            color="blue"
          />
        );
      }

      if (
        text.includes(
          "guide"
        )
      ) {
        return (
          <FaMapMarkedAlt
            color="green"
          />
        );
      }

      return (
        <FaCheckCircle
          color="green"
        />
      );
    };

  const leftSeat =
    Math.max(
      Number(
        trip.numberOfTravelers ||
          0
      ) -
        Number(
          trip.reservedTravelers ||
            0
        ),
      0
    );

  const tripDuration =
    getDurationData(
      trip.duration
    );

  const tripId =
    trip._id ||
    trip.id ||
    id;

  return (
    <div className="trip-page">
      <DashboardLayout>
        {/* Hero image */}

        <div
          className="hero"
          style={{
            backgroundImage:
              `url("${heroImage}")`,
          }}
        >
          <div className="hero-content">
            <h1>
              {trip.title}
            </h1>

            <div className="price-section">
              <div>
                <h2>
                  ${trip.price}
                </h2>

                <p>
                  Per Person
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main information */}

        <div className="top-info-grid">
          <div className="top-info-card">
            <div className="top-icon-box blue-bg">
              {getTransportIcon(
                trip.transportation
              )}
            </div>

            <div className="top-info-text">
              <p>
                Transportation
              </p>

              <h4>
                {trip.transportation}
              </h4>
            </div>
          </div>

          <div className="top-info-card">
            <div className="top-icon-box purple-bg">
              <FaMapMarkedAlt />
            </div>

            <div className="top-info-text">
              <p>
                Trip Type
              </p>

              <h4>
                {trip.tripType}
              </h4>
            </div>
          </div>

          <div className="top-info-card">
            <div className="top-icon-box green-bg">
              {getStatusIcon(
                trip.status
              )}
            </div>

            <div className="top-info-text">
              <p>
                Status
              </p>

              <h4>
                {trip.status}
              </h4>
            </div>
          </div>

          <div className="top-info-card">
            <div className="top-icon-box orange-bg">
              <FaUsers />
            </div>

            <div className="top-info-text">
              <p>
                Travelers
              </p>

              <h5>
                Total Travelers :{" "}
                {
                  trip.numberOfTravelers
                }
              </h5>

              <h5>
                Left Seat :{" "}
                {leftSeat}
              </h5>
            </div>
          </div>

          <div className="top-info-card">
            <div className="top-icon-box gray-bg">
              <FaStar />
            </div>

            <div className="top-info-text">
              <p>
                Price
              </p>

              <h4>
                ${trip.price}
              </h4>
            </div>
          </div>
        </div>

        {/* Description and inclusions */}

        <div className="about-inclusions">
          <div className="card about-box">
            <div className="about-header">
              <span className="about-tag">
                ✨ Travel Experience
              </span>

              <h2>
                About This Trip
              </h2>

              <p className="about-text">
                {trip.description}
              </p>
            </div>

            <div className="trip-extra">
              <div className="trip-extra-item">
                <div className="icon-box clock">
                  <FaClock />
                </div>

                <div>
                  <span>
                    Total Duration
                  </span>

                  <h5>
                    {
                      tripDuration.value
                    }{" "}
                    {
                      tripDuration.unit
                    }
                  </h5>
                </div>
              </div>

              <div className="trip-extra-item">
                <div className="icon-box users">
                  <FaUsers />
                </div>

                <div>
                  <span>
                    Travelers
                  </span>

                  <h5>
                    Total Travelers :{" "}
                    {
                      trip.numberOfTravelers
                    }
                  </h5>

                  <h5>
                    Left Seat :{" "}
                    {leftSeat}
                  </h5>
                </div>
              </div>

              <div className="trip-extra-item">
                <div className="icon-box map">
                  <FaMapMarkerAlt />
                </div>

                <div>
                  <span>
                    Destinations
                  </span>

                  <h5>
                    {
                      trip.places
                        ?.length ||
                      0
                    }{" "}
                    Cities
                  </h5>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>
              Inclusions
            </h3>

            <div className="inclusions-grid">
              {trip.inclusions?.map(
                (
                  item,
                  index
                ) => (
                  <div
                    className="inclusion-row"
                    key={index}
                  >
                    {getInclusionIcon(
                      item
                    )}

                    <span>
                      {item}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Itinerary and weather */}

        <div className="card card3">
          <h3>
            Itinerary &amp; Weather Forecast
          </h3>

          <div className="timeline">
            {trip.places?.map(
              (
                place,
                index
              ) => {
                const stayDuration =
                  getDurationData(
                    place.duration ??
                      place.days
                  );

                const placeImage =
                  getPlaceDisplayImage(
                    place,
                    trip
                  );

                return (
                  <div
                    className="timeline-item"
                    key={index}
                  >
                    <div className="timeline-left">
                      <div className="circle">
                        {index + 1}
                      </div>

                      {index !==
                        trip.places
                          .length -
                          1 && (
                        <div className="line"></div>
                      )}
                    </div>

                    <div className="timeline-content">
                      <div className="place-info">
                        <img
                          src={
                            placeImage
                          }
                          alt={
                            place.city ||
                            "Trip destination"
                          }
                          loading="lazy"
                          onError={(
                            event
                          ) => {
                            event.currentTarget.onerror =
                              null;

                            event.currentTarget.src =
                              defaultTripImage;
                          }}
                        />

                        <div>
                          <h4>
                            {
                              place.city
                            }
                          </h4>

                          <p>
                            {
                              stayDuration.value
                            }{" "}
                            {
                              stayDuration.unit
                            }{" "}
                            Stay
                          </p>
                        </div>
                      </div>

                      <div className="forecast-container">
                        {weatherMessage ? (
                          <div className="weather-unavailable">
                            <div className="weather-message-icon">
                              🌤️
                            </div>

                            <div className="weather-message-content">
                              <h4>
                                Weather Forecast Coming Soon
                              </h4>

                              <p>
                                {
                                  weatherMessage
                                }
                              </p>

                              <span>
                                📅 Check again closer to your departure date
                              </span>
                            </div>
                          </div>
                        ) : (
                          forecast
                            ?.filter(
                              (
                                weather
                              ) =>
                                weather.city ===
                                place.city
                            )
                            .map(
                              (
                                cityWeather
                              ) =>
                                cityWeather.forecast.map(
                                  (
                                    weather,
                                    weatherIndex
                                  ) => (
                                    <div
                                      key={
                                        weatherIndex
                                      }
                                      className="forecast-card"
                                    >
                                      <p>
                                        {
                                          weather.date
                                        }
                                      </p>

                                      <div className="weather-icon-box">
                                        {getWeatherIcon(
                                          weather.maxTemp
                                        )}
                                      </div>

                                      <span>
                                        {
                                          weather.maxTemp
                                        }
                                        ° /{" "}
                                        {
                                          weather.minTemp
                                        }
                                        °
                                      </span>
                                    </div>
                                  )
                                )
                            )
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Booking */}

        <div className="book-section">
          <button
            className="book-btn"
            onClick={() => {
              if (tripId) {
                navigate(
                  `/payment/${tripId}`
                );
              }
            }}
          >
            Book This Trip
          </button>
        </div>
      </DashboardLayout>
    </div>
  );
}