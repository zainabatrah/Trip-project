import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import api from "../services/api";
import {
  getCurrentUser,
} from "../api/auth.js";

import "./MyTrip.css";

const defaultTripImage =
  "/Images/Libanon233.jpg";

/*
|--------------------------------------------------------------------------
| Destination helpers
|--------------------------------------------------------------------------
*/

function getDestinationName(trip) {
  const firstPlace =
    Array.isArray(trip?.places) &&
    trip.places.length > 0
      ? trip.places[0]
      : null;

  return String(
    trip?.to ||
      trip?.destination ||
      firstPlace?.city ||
      trip?.country ||
      ""
  ).trim();
}

function createDestinationSlug(
  destination
) {
  return String(destination || "")
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}

function getDestinationImage(trip) {
  const destination =
    getDestinationName(trip);

  const slug =
    createDestinationSlug(
      destination
    );

  if (!slug) {
    return defaultTripImage;
  }

  return `/Images/${slug}.jpg`;
}

function getInitialTripImage(trip) {
  const savedPhoto = String(
    trip?.photo || ""
  ).trim();

  if (savedPhoto) {
    return savedPhoto;
  }

  return getDestinationImage(
    trip
  );
}

/*
|--------------------------------------------------------------------------
| Reusable trip image
|--------------------------------------------------------------------------
*/

function TripImage({ trip }) {
  const [image, setImage] =
    useState(() =>
      getInitialTripImage(trip)
    );

  function handleImageError() {
    const destinationImage =
      getDestinationImage(trip);

    setImage((currentImage) => {
      if (
        currentImage !==
          destinationImage &&
        destinationImage !==
          defaultTripImage
      ) {
        return destinationImage;
      }

      if (
        currentImage !==
        defaultTripImage
      ) {
        return defaultTripImage;
      }

      return currentImage;
    });
  }

  return (
    <img
      src={image}
      alt={
        trip?.title ||
        getDestinationName(trip) ||
        "Trip"
      }
      loading="lazy"
      onError={
        handleImageError
      }
    />
  );
}

/*
|--------------------------------------------------------------------------
| Duration formatter
|--------------------------------------------------------------------------
*/

function formatDuration(duration) {
  if (
    duration &&
    typeof duration === "object"
  ) {
    const value =
      duration.value ??
      duration.amount ??
      duration.days ??
      duration.hours ??
      0;

    const unit =
      duration.unit ||
      (duration.hours !==
      undefined
        ? "hours"
        : "days");

    return `${value} ${unit}`;
  }

  if (duration) {
    return `${duration} days`;
  }

  return "Duration unavailable";
}

/*
|--------------------------------------------------------------------------
| Text helpers
|--------------------------------------------------------------------------
*/

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function capitalize(value) {
  const text = String(
    value || ""
  ).trim();

  if (!text) {
    return "Not specified";
  }

  return (
    text.charAt(0).toUpperCase() +
    text.slice(1)
  );
}

/*
|--------------------------------------------------------------------------
| Main component
|--------------------------------------------------------------------------
*/
function isTripFinished(date) {
  if (!date) return false;

  const tripDate = new Date(date);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  tripDate.setHours(0, 0, 0, 0);

  return tripDate < today;
}

export default function MyTrips() {
  const navigate =
    useNavigate();

  const [
    bookings,
    setBookings,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [error, setError] =
    useState("");

  const [
    cancellingId,
    setCancellingId,
  ] = useState("");

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("All");

  const [
    typeFilter,
    setTypeFilter,
  ] = useState("All");

  /*
  |--------------------------------------------------------------------------
  | Load user bookings
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    async function fetchTrips() {
      try {
        setLoading(true);
        setError("");

        const user =
          getCurrentUser();

        const userId =
          user?._id ||
          user?.id;

        if (!userId) {
          navigate("/login", {
            replace: true,
          });

          return;
        }

        const response =
          await api.get(
            `/bookings/my-trips/${userId}`
          );

        if (cancelled) {
          return;
        }

        const receivedBookings =
          Array.isArray(
            response.data?.bookings
          )
            ? response.data.bookings
            : [];

        setBookings(
          receivedBookings
        );
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        console.error(
          "Cannot load bookings:",
          requestError.response
            ?.data ||
            requestError
        );

        setBookings([]);

        setError(
          requestError.response
            ?.data?.message ||
            "Cannot load your trips."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchTrips();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  /*
  |--------------------------------------------------------------------------
  | Cancel booking
  |--------------------------------------------------------------------------
  */

  async function cancelTrip(
    bookingId
  ) {
    if (!bookingId) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to cancel this trip?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(
        bookingId
      );

      setError("");

      await api.put(
        `/bookings/cancel/${bookingId}`
      );

      setBookings(
        (previousBookings) =>
          previousBookings.map(
            (booking) =>
              booking._id ===
              bookingId
                ? {
                    ...booking,
                    bookingStatus:
                      "cancelled",
                  }
                : booking
          )
      );
    } catch (requestError) {
      console.error(
        "Cannot cancel booking:",
        requestError.response
          ?.data ||
          requestError
      );

      setError(
        requestError.response
          ?.data?.message ||
          "Cannot cancel this trip."
      );
    } finally {
      setCancellingId("");
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Filter bookings
  |--------------------------------------------------------------------------
  */

  const normalizedSearch =
    normalizeText(search);

  const filteredBookings =
    bookings.filter(
      (booking) => {
        const trip =
          booking?.tripId;

        if (
          !trip ||
          typeof trip !== "object"
        ) {
          return false;
        }

        const title =
          normalizeText(
            trip.title
          );

        const country =
          normalizeText(
            trip.country
          );

        const destination =
          normalizeText(
            getDestinationName(
              trip
            )
          );

        const type =
          normalizeText(
            trip.tripType
          );

        const bookingStatus =
          normalizeText(
            booking.bookingStatus
          );

        const searchMatch =
          !normalizedSearch ||
          title.includes(
            normalizedSearch
          ) ||
          country.includes(
            normalizedSearch
          ) ||
          destination.includes(
            normalizedSearch
          ) ||
          type.includes(
            normalizedSearch
          );

        const statusMatch =
          filter === "All" ||
          bookingStatus ===
            normalizeText(filter);

        const typeMatch =
          typeFilter === "All" ||
          type ===
            normalizeText(
              typeFilter
            );

        return (
          searchMatch &&
          statusMatch &&
          typeMatch
        );
      }
    );

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <h2 className="loading">
        Loading trips...
      </h2>
    );
  }

  return (
    <div className="mybody">
      <div className="myTrips">
        <div className="toolbar">
          <input
            type="text"
            placeholder="Search by title, destination, or type..."
            className="searchInput"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

          <select
            className="filter"
            value={filter}
            onChange={(event) =>
              setFilter(
                event.target.value
              )
            }
          >
            <option value="All">
              All Statuses
            </option>

            <option value="paid">
              Paid
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>

          <select
            className="filter"
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target.value
              )
            }
          >
            <option value="All">
              All Types
            </option>

            <option value="adventure">
              Adventure
            </option>

            <option value="relax">
              Relax
            </option>

            <option value="business">
              Business
            </option>

            <option value="family">
              Family
            </option>

            <option value="public">
              Public
            </option>

            <option value="cultural">
              Cultural
            </option>

            <option value="nature">
              Nature
            </option>

            <option value="heritage">
              Heritage
            </option>

            <option value="city tour">
              City Tour
            </option>
          </select>
        </div>

        {error && (
          <div className="error-box">
            <span className="error-icon">
              ⚠
            </span>

            <span>{error}</span>
          </div>
        )}

        {filteredBookings.length ===
        0 ? (
          <div className="noTrips">
            <h2>
              No trips found
            </h2>

            <p>
              You do not have any
              matching booked trips.
            </p>

            <Link
              to="/trips"
              className="detailsBtn"
            >
              Browse Trips
            </Link>
          </div>
        ) : (
          filteredBookings.map(
            (booking) => {
              const trip =
                booking.tripId;

              const tripId =
                trip?._id ||
                trip?.id;

              const destination =
                getDestinationName(
                  trip
                ) || "Lebanon";

              const bookingStatus =
                normalizeText(
                  booking.bookingStatus
                );

              const isCancelled =
                bookingStatus ===
                "cancelled";
const tripFinished =
  isTripFinished(trip.date);
              return (
                <div
                  className="tripCard"
                  key={booking._id}
                >
                  <TripImage
                    key={[
                      trip?._id ||
                        trip?.id ||
                        "",
                      trip?.photo || "",
                      trip?.to || "",
                      trip?.country || "",
                    ].join(":")}
                    trip={trip}
                  />

                  <div className="tripInfo">
                    <div className="topRow">
                      <div>
                        <h2>
                          {trip.title ||
                            "Untitled Trip"}
                        </h2>

                        <p className="country">
                          📍{" "}
                          {destination}
                        </p>

                        <p>
                          🏷{" "}
                          {capitalize(
                            trip.tripType
                          )}
                        </p>
                      </div>

                      <span
                        className={`status ${bookingStatus}`}
                      >
                        {isCancelled
                          ? "Cancelled"
                          : capitalize(
                              bookingStatus ||
                                "paid"
                            )}
                      </span>
                    </div>

                    <div className="details">

  <span>
    📅{" "}
    {trip.date
      ? new Date(trip.date).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric"
          }
        )
      : "Date unavailable"}
  </span>

  <span>
    🕒{" "}
    {formatDuration(
      trip.duration
    )}
  </span>

  <span>
    ✈{" "}
    {capitalize(
      trip.transportation
    )}
  </span>

  <span>
    👥{" "}
    {Number(
      booking.travelers || 0
    )}{" "}
    Traveler
    {Number(
      booking.travelers || 0
    ) === 1
      ? ""
      : "s"}
  </span>

</div>
{tripFinished && !isCancelled && (
  <div className="feedbackBox">
    <p>
      🎉 Your trip has finished!
      We would love to hear your experience.
    </p>

    <Link
      to={`/feedback/${tripId}`}
      className="feedbackBtn"
    >
      Give Feedback
    </Link>
  </div>
)}
                    <div className="bottomRow">
                      <h3>
                        $
                        {Number(
                          booking.totalPrice ||
                            0
                        ).toFixed(2)}
                      </h3>

                      <div className="buttons">
                        {tripId && (
                          <Link
                            to={`/trips/${tripId}`}
                            className="detailsBtn"
                          >
                            View Details
                          </Link>
                        )}

                   {!isCancelled && !tripFinished && (
  <button
    type="button"
    className="cancelBtn"
    disabled={
      cancellingId === booking._id
    }
    onClick={() =>
      cancelTrip(
        booking._id
      )
    }
  >
    {cancellingId === booking._id
      ? "Cancelling..."
      : "Cancel"}
  </button>
)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          )
        )}
      </div>
    </div>
  );
}
