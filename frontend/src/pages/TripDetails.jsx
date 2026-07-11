import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { getTripById } from "../api/trips.js";
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

function getErrorMessage(error) {
  if (
    error?.status === 400 ||
    error?.status === 404
  ) {
    return "Trip not found.";
  }

  if (error?.status === 401) {
    return "Please log in to view this trip.";
  }

  if (error?.status === 403) {
    return "You are not allowed to view this trip.";
  }

  if (error?.status >= 500) {
    return "Server error. Please try again.";
  }

  return (
    error?.message ||
    "Failed to load trip data."
  );
}

function getDurationData(
  value,
  fallbackUnit = "days"
) {
  if (
    value &&
    typeof value === "object"
  ) {
    const durationValue =
      value.value ??
      value.amount ??
      value.days ??
      value.hours;

    if (
      durationValue !== undefined &&
      durationValue !== null &&
      durationValue !== ""
    ) {
      return {
        value: durationValue,
        unit:
          String(
            value.unit ||
              fallbackUnit
          ).trim() || fallbackUnit,
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
      unit: fallbackUnit,
    };
  }

  return {
    value: 0,
    unit: fallbackUnit,
  };
}

export default function TripDetails() {
  const { id } = useParams();

  const [trip, setTrip] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [weatherMessage, setWeatherMessage] =
    useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function fetchTrip() {
      if (!id) {
        setTrip(null);
        setForecast([]);
        setWeatherMessage("");
        setError("Trip not found.");
        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setError("");

        const data =
          await getTripById(id);

        if (cancelled) {
          return;
        }

        if (!data?.trip) {
          setTrip(null);
          setForecast([]);
          setWeatherMessage("");
          setError("Trip not found.");

          return;
        }

        setTrip(data.trip);

        if (Array.isArray(data.weather)) {
          setForecast(data.weather);
          setWeatherMessage("");
        } else if (
          data.weather &&
          typeof data.weather ===
            "object" &&
          data.weather.message
        ) {
          setWeatherMessage(
            data.weather.message
          );
          setForecast([]);
        } else {
          setForecast([]);
          setWeatherMessage("");
        }
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setTrip(null);
        setForecast([]);
        setWeatherMessage("");
        setError(
          getErrorMessage(
            requestError
          )
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchTrip();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <h2>Loading...</h2>;

  if (error) return <h2>{error}</h2>;

  if (!trip) return <h2>Trip not found.</h2>;

  const getWeatherIcon = (temp) => {
    if (temp >= 38)
      return <span className="weather-main-icon">🔥</span>;

    if (temp >= 32)
      return <span className="weather-main-icon">🥵</span>;

    if (temp >= 27)
      return <span className="weather-main-icon">☀️</span>;

    if (temp >= 23)
      return <span className="weather-main-icon">🌤️</span>;

    if (temp >= 18)
      return <span className="weather-main-icon">⛅</span>;

    if (temp >= 15)
      return <span className="weather-main-icon">☁️</span>;

    if (temp >= 12)
      return <span className="weather-main-icon">🌦️</span>;

    if (temp >= 9)
      return <span className="weather-main-icon">🌧️</span>;

    if (temp >= 6)
      return <span className="weather-main-icon">⛈️</span>;

    if (temp >= 3)
      return <span className="weather-main-icon">🌨️</span>;

    if (temp >= -5)
      return <span className="weather-main-icon">❄️</span>;

    return <span className="weather-main-icon">🥶</span>;
  };

  const getStatusIcon = (status) => {
    const s = String(
      status || ""
    ).toLowerCase();

    if (s === "completed")
      return <FaCheckCircle color="green" />;

    if (s === "ongoing")
      return <FaPlayCircle color="orange" />;

    if (s === "planned")
      return <FaHourglassHalf color="blue" />;

    return <FaTimesCircle color="red" />;
  };

  const getTransportIcon = (type) => {
    const t = type?.toLowerCase();

    if (t?.includes("flight") || t?.includes("plane"))
      return <FaPlane />;

    if (t?.includes("bus"))
      return <FaBus />;

    if (t?.includes("car"))
      return <FaCar />;

    if (t?.includes("ship") || t?.includes("boat"))
      return <FaShip />;

    return <FaPlane />;
  };

  const getInclusionIcon = (item) => {
    const text = String(
      item || ""
    ).toLowerCase();

    if (text.includes("food") || text.includes("meal"))
      return <FaUtensils color="orange" />;

    if (text.includes("hotel") || text.includes("stay"))
      return <FaHotel color="purple" />;

    if (
      text.includes("transport") ||
      text.includes("bus") ||
      text.includes("flight")
    )
      return <FaBus color="blue" />;

    if (text.includes("guide"))
      return <FaMapMarkedAlt color="green" />;

    return <FaCheckCircle color="green" />;
  };

  const leftSeat = Math.max(
    Number(
      trip.numberOfTravelers || 0
    ) -
      Number(
        trip.reservedTravelers || 0
      ),
    0
  );

  const tripDuration =
    getDurationData(trip.duration);

  const tripId =
    trip._id || trip.id || id;

  return (
    <div className="trip-page">
      <DashboardLayout>
        <div
          className="hero"
          style={{
            backgroundImage: ` url(${trip.photo})`,
          }}
        >
          <div className="hero-content">
            <h1>{trip.title}</h1>

            <div className="price-section">
              <div>
                <h2>${trip.price}</h2>
                <p>Per Person</p>
              </div>
            </div>
          </div>
        </div>

        <div className="top-info-grid">
          <div className="top-info-card">
            <div className="top-icon-box blue-bg">
              {getTransportIcon(
                trip.transportation
              )}
            </div>

            <div className="top-info-text">
              <p>Transportation</p>
              <h4>{trip.transportation}</h4>
            </div>
          </div>

          <div className="top-info-card">
            <div className="top-icon-box purple-bg">
              <FaMapMarkedAlt />
            </div>

            <div className="top-info-text">
              <p>Trip Type</p>
              <h4>{trip.tripType}</h4>
            </div>
          </div>

          <div className="top-info-card">
            <div className="top-icon-box green-bg">
              {getStatusIcon(
                trip.status
              )}
            </div>

            <div className="top-info-text">
              <p>Status</p>
              <h4>{trip.status}</h4>
            </div>
          </div>

          <div className="top-info-card">
            <div className="top-icon-box orange-bg">
              <FaUsers />
            </div>

            <div className="top-info-text">
              <p>Travelers</p>
              <h5>
                Total Travelers : {trip.numberOfTravelers}{" "}
              </h5>
              <h5>Left Seat : {leftSeat} </h5>
            </div>
          </div>

          <div className="top-info-card">
            <div className="top-icon-box gray-bg">
              <FaStar />
            </div>

            <div className="top-info-text">
              <p>Price</p>
              <h4>${trip.price}</h4>
            </div>
          </div>
        </div>

        <div className="about-inclusions">
          <div className="card about-box">
            <div className="about-header">
              <span className="about-tag">
                ✨ Travel Experience
              </span>
              <h2>About This Trip</h2>
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
                  <span>Total Duration</span>
                  <h5>
                    {tripDuration.value}{" "}
                    {tripDuration.unit}
                  </h5>
                </div>
              </div>

              <div className="trip-extra-item">
                <div className="icon-box users">
                  <FaUsers />
                </div>
                <div>
                  <span>Travelers</span>
                  <h5>
                    Total Travelers :
                    {trip.numberOfTravelers}{" "}
                  </h5>
                  <h5>
                    Left Seat :{leftSeat}{" "}
                  </h5>
                </div>
              </div>

              <div className="trip-extra-item">
                <div className="icon-box map">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <span>Destinations</span>
                  <h5>
                    {trip.places?.length || 0} Cities
                  </h5>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>Inclusions</h3>

            <div className="inclusions-grid">
              {trip.inclusions?.map(
                (item, index) => (
                  <div
                    className="inclusion-row"
                    key={index}
                  >
                    {getInclusionIcon(item)}

                    <span>{item}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        <div className="card card3">
          <h3>Itinerary & Weather Forecast</h3>

          <div className="timeline">
            {trip.places?.map(
              (place, index) => {
                const stayDuration =
                  getDurationData(
                    place.duration ??
                      place.days
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
                        trip.places.length - 1 && (
                        <div className="line"></div>
                      )}
                    </div>

                    <div className="timeline-content">
                      <div className="place-info">
                        <img
                          src={place.image}
                          alt={place.city}
                        />

                        <div>
                          <h4>{place.city}</h4>

                          <p>
                            {stayDuration.value}{" "}
                            {stayDuration.unit} Stay
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
                                {weatherMessage}
                              </p>

                              <span>
                                📅 Check again closer to your departure date
                              </span>
                            </div>
                          </div>
                        ) : (
                          forecast
                            ?.filter(
                              (w) =>
                                w.city ===
                                place.city
                            )
                            .map(
                              (cityWeather) =>
                                cityWeather.forecast.map(
                                  (f, j) => (
                                    <div
                                      key={j}
                                      className="forecast-card"
                                    >
                                      <p>
                                        {f.date}
                                      </p>

                                      <div className="weather-icon-box">
                                        {getWeatherIcon(
                                          f.maxTemp
                                        )}
                                      </div>

                                      <span>
                                        {f.maxTemp}° /{" "}
                                        {f.minTemp}°
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
