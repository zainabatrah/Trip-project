import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import "./tripdetail.css";

import TopNavbar from "../components/TopNavbar";
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


import {
  WiDaySunny,
  WiCloud,
  WiRain,
  WiSnow,
  WiDayCloudy
} from "react-icons/wi"


export default function TripDetails() {
  const { id } = useParams();

  const [trip, settrip] = useState(null);
  const [forecast, setforecast] = useState(null);
  const [loading, setloading] = useState(true);
  const [error, seterror] = useState("");


  const [open, setOpen] = useState(false);
  useEffect(() => {
    const fetchtrip = async () => {
      try {
        const response = await api.get(`/trips/${id}`);

        settrip(response.data.trip);
        setforecast(response.data.weather);
      } catch (err) {
        seterror("Failed to load trip data");
        console.log(err);
      } finally {
        setloading(false);
      }
    };

    fetchtrip();
  }, [id]);

  if (loading) return <h2>Loading...</h2>;

  if (error) return <h2>{error}</h2>;

  /* ================= WEATHER ICON ================= */

 const getWeatherIcon = (temp) => {

  // VERY HOT
  if (temp >= 38)
    return <span className="weather-main-icon">🔥</span>;

  // HOT
  if (temp >= 32)
    return <span className="weather-main-icon">🥵</span>;

  // SUNNY
  if (temp >= 27)
    return <span className="weather-main-icon">☀️</span>;

  // PARTLY SUNNY
  if (temp >= 23)
    return <span className="weather-main-icon">🌤️</span>;

  // PARTLY CLOUDY
  if (temp >= 18)
    return <span className="weather-main-icon">⛅</span>;

  // CLOUDY
  if (temp >= 15)
    return <span className="weather-main-icon">☁️</span>;

  // LIGHT RAIN
  if (temp >= 12)
    return <span className="weather-main-icon">🌦️</span>;

  // NORMAL RAIN
  if (temp >= 9)
    return <span className="weather-main-icon">🌧️</span>;

  // HEAVY RAIN
  if (temp >= 6)
    return <span className="weather-main-icon">⛈️</span>;

  // SNOW RAIN
  if (temp >= 3)
    return <span className="weather-main-icon">🌨️</span>;

  // SNOW
  if (temp >= -5)
    return <span className="weather-main-icon">❄️</span>;

  // EXTREME COLD
  return <span className="weather-main-icon">🥶</span>;
};

  /* ================= STATUS ICON ================= */

  const getStatusIcon = (status) => {
    const s = status.toLowerCase();

    if (s === "completed")
      return <FaCheckCircle color="green" />;

    if (s === "ongoing")
      return <FaPlayCircle color="orange" />;

    if (s === "planned")
      return <FaHourglassHalf color="blue" />;

    return <FaTimesCircle color="red" />;
  };

  /* ================= TRANSPORT ICON ================= */

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

  /* ================= INCLUSION ICON ================= */

  const getInclusionIcon = (item) => {
    const text = item.toLowerCase();

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
const leftseat=trip.numberOfTravelers-trip.reservedTravelers
  return (

    <div className="trip-page">

<DashboardLayout>
      {/* HERO */}



      <div
        className="hero"
        style={{
          backgroundImage: ` url(${trip.photo})`
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

      {/* TOP INFO */}

      <div className="top-info-grid">

        <div className="top-info-card">
          <div className="top-icon-box blue-bg">
            {getTransportIcon(trip.transportation)}
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
            {getStatusIcon(trip.status)}
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
            <h5>Total Travelers : {trip.numberOfTravelers} </h5>
             <h5>Left Seat : {leftseat} </h5>
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

      {/* ABOUT + INCLUSIONS */}

      <div className="about-inclusions">

        {/* ABOUT */}

        <div className="card about-box">

  <div className="about-header">
    <span className="about-tag">✨ Travel Experience</span>
    <h2>About This Trip</h2>
    <p className="about-text">{trip.description}</p>
  </div>

  <div className="trip-extra">

    <div className="trip-extra-item">
      <div className="icon-box clock">
        <FaClock />
      </div>
      <div>
        <span>Total Duration</span>
        <h5>{trip.duration} Days</h5>
      </div>
    </div>

    <div className="trip-extra-item">
      <div className="icon-box users">
        <FaUsers />
      </div>
      <div>
        <span>Travelers</span>
        <h5>Total Travelers :{trip.numberOfTravelers} </h5>
         <h5>Left Seat :{leftseat} </h5>
      </div>
    </div>

    <div className="trip-extra-item">
      <div className="icon-box map">
        <FaMapMarkerAlt />
      </div>
      <div>
        <span>Destinations</span>
        <h5>{trip.places?.length || 0} Cities</h5>
      </div>
    </div>

  </div>
</div>
        {/* INCLUSIONS */}

        <div className="card">

          <h3>Inclusions</h3>

          <div className="inclusions-grid">

            {trip.inclusions?.map((item, index) => (

              <div className="inclusion-row" key={index}>

                {getInclusionIcon(item)}

                <span>{item}</span>

              </div>

            ))}

          </div>

        </div>

      </div>

      {/* ITINERARY */}

      <div className="card card3">

        <h3>Itinerary & Weather Forecast</h3>

        <div className="timeline">

          {trip.places?.map((place, index) => (

            <div className="timeline-item" key={index}>

              <div className="timeline-left">

                <div className="circle">
                  {index + 1}
                </div>

                {index !== trip.places.length - 1 && (
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

                    <p>{place.days} Days Stay</p>

                  </div>

                </div>

                <div className="forecast-container">

                  {forecast
                    ?.filter((w) => w.city === place.city)
                    .map((cityWeather) =>
                      cityWeather.forecast.map((f, j) => (

                        <div
                          key={j}
                          className="forecast-card"
                        >

                          <p>{f.date}</p>

                         <div className="weather-icon-box">
  {getWeatherIcon(f.maxTemp)}
</div>

                          <span>
                            {f.maxTemp}° / {f.minTemp}°
                          </span>

                        </div>

                      ))
                    )}

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* BOOK BUTTON */}

      <div className="book-section">

        <button className="book-btn">
          Book This Trip
        </button>

      </div>
</DashboardLayout>
    </div>
  
  );
}




