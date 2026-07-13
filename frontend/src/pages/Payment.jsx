import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout.jsx";
import { pageTheme } from "../components/publicPageTheme.js";
import { getCurrentUser, isLoggedIn } from "../api/auth.js";
import { bookTrip, getTripById } from "../api/trips.js";

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function getErrorMessage(error) {
  if (error?.status === 401) {
    return "Please log in to complete your booking.";
  }

  if (error?.status === 404) {
    return "Trip not found.";
  }

  if (error?.status === 409) {
    return (
      error.message ||
      "This trip cannot be booked right now."
    );
  }

  if (error?.status >= 500) {
    return "Server error. Please try again.";
  }

  return (
    error?.message ||
    "Failed to load the booking page."
  );
}

export default function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTrip() {
      if (!id) {
        setError("Trip not found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getTripById(id);

        if (!cancelled) {
          setTrip(data?.trip || null);
        }
      } catch (requestError) {
        if (!cancelled) {
          setTrip(null);
          setError(
            getErrorMessage(requestError)
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTrip();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const user = getCurrentUser();
  const seatsLeft = useMemo(() => {
    if (!trip) {
      return 0;
    }

    return Math.max(
      Number(trip.numberOfTravelers || 0) -
        Number(trip.reservedTravelers || 0),
      0
    );
  }, [trip]);

  async function handleBooking() {
    if (submitting || !trip) {
      return;
    }

    if (!isLoggedIn()) {
      navigate("/login", {
        replace: false,
      });
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const data = await bookTrip(
        trip._id || trip.id || id
      );

      setTrip(data.trip);
      setSuccess(
        data.message ||
          "Trip booked successfully."
      );
    } catch (requestError) {
      setError(
        getErrorMessage(requestError)
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout>
      <div style={pageTheme.page}>
        <div style={pageTheme.main}>
          <div
            style={{
              ...pageTheme.contentWrapper,
              maxWidth: 980,
            }}
          >
            <header style={pageTheme.header}>
              <div style={pageTheme.titleGroup}>
                <span style={pageTheme.eyebrow}>
                  Booking
                </span>
                <h1 style={pageTheme.title}>
                  Complete Your Trip Booking
                </h1>
                <p style={pageTheme.subtitle}>
                  Review the selected trip and confirm your seat without changing the existing trip details page flow.
                </p>
              </div>
            </header>

            {loading ? (
              <div style={pageTheme.emptyBox}>
                Loading booking details...
              </div>
            ) : error && !trip ? (
              <div style={pageTheme.errorBox}>
                {error}
              </div>
            ) : !trip ? (
              <div style={pageTheme.emptyBox}>
                Trip not found.
              </div>
            ) : (
              <section style={pageTheme.surface}>
                {error && (
                  <div style={pageTheme.errorBox}>
                    {error}
                  </div>
                )}

                {success && (
                  <div style={pageTheme.successBox}>
                    {success}
                  </div>
                )}

                <div style={styles.grid}>
                  <div style={styles.summary}>
                    <img
                      src={trip.photo}
                      alt={trip.title}
                      style={styles.image}
                    />

                    <div style={styles.details}>
                      <h2 style={styles.tripTitle}>
                        {trip.title}
                      </h2>
                      <p style={styles.route}>
                        {trip.from} to {trip.to}
                      </p>
                      <p style={styles.description}>
                        {trip.description}
                      </p>

                      <div style={styles.metaGrid}>
                        <Info
                          label="Date"
                          value={formatDate(
                            trip.date
                          )}
                        />
                        <Info
                          label="Price"
                          value={`$${Number(
                            trip.price || 0
                          ).toFixed(2)}`}
                        />
                        <Info
                          label="Status"
                          value={trip.status}
                        />
                        <Info
                          label="Seats Left"
                          value={seatsLeft}
                        />
                      </div>
                    </div>
                  </div>

                  <aside style={pageTheme.softSurface}>
                    <h3 style={pageTheme.smallTitle}>
                      Booking Summary
                    </h3>

                    <div style={styles.stack}>
                      <Line
                        label="Traveler"
                        value={
                          user?.fullName ||
                          "Guest"
                        }
                      />
                      <Line
                        label="Email"
                        value={
                          user?.email ||
                          "Login required"
                        }
                      />
                      <Line
                        label="Trip"
                        value={trip.title}
                      />
                      <Line
                        label="Amount"
                        value={`$${Number(
                          trip.price || 0
                        ).toFixed(2)}`}
                      />
                    </div>

                    <div style={pageTheme.divider} />

                    {!isLoggedIn() ? (
                      <div style={styles.stack}>
                        <p style={styles.notice}>
                          You need to log in before confirming this booking.
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            navigate("/login")
                          }
                          style={pageTheme.buttonPrimary}
                        >
                          Login to Continue
                        </button>
                      </div>
                    ) : (
                      <div style={styles.stack}>
                        <button
                          type="button"
                          onClick={
                            handleBooking
                          }
                          disabled={
                            submitting ||
                            seatsLeft === 0
                          }
                          style={{
                            ...pageTheme.buttonPrimary,
                            opacity:
                              submitting ||
                              seatsLeft === 0
                                ? 0.7
                                : 1,
                            cursor:
                              submitting ||
                              seatsLeft === 0
                                ? "not-allowed"
                                : "pointer",
                            textAlign: "center",
                          }}
                        >
                          {submitting
                            ? "Confirming..."
                            : seatsLeft === 0
                              ? "Fully Booked"
                              : "Confirm Booking"}
                        </button>

                        <p style={styles.notice}>
                          This booking reserves one seat on the selected trip.
                        </p>
                      </div>
                    )}

                    <div style={styles.actions}>
                      <Link
                        to={`/trips/${trip._id || trip.id || id}`}
                        style={pageTheme.buttonSecondary}
                      >
                        Back to Trip
                      </Link>

                      <Link
                        to="/trips"
                        style={pageTheme.buttonSecondary}
                      >
                        Browse Trips
                      </Link>
                    </div>
                  </aside>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Info({ label, value }) {
  return (
    <div style={styles.info}>
      <span style={styles.infoLabel}>
        {label}
      </span>
      <strong>{value}</strong>
    </div>
  );
}

function Line({ label, value }) {
  return (
    <div style={styles.line}>
      <span style={styles.infoLabel}>
        {label}
      </span>
      <strong style={styles.lineValue}>
        {value}
      </strong>
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1.4fr) minmax(280px, 0.8fr)",
    gap: 22,
  },

  summary: {
    display: "grid",
    gap: 18,
  },

  image: {
    width: "100%",
    height: 300,
    objectFit: "cover",
    borderRadius: 20,
    border: "1px solid rgba(147, 197, 253, 0.45)",
  },

  details: {
    display: "grid",
    gap: 12,
  },

  tripTitle: {
    margin: 0,
    fontSize: 28,
    fontWeight: 900,
    color: "#1e3a8a",
  },

  route: {
    margin: 0,
    color: "#2563eb",
    fontWeight: 800,
  },

  description: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.7,
  },

  metaGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 12,
  },

  info: {
    display: "grid",
    gap: 5,
    padding: 16,
    borderRadius: 16,
    background: "rgba(255, 255, 255, 0.78)",
    border: "1px solid rgba(147, 197, 253, 0.4)",
  },

  infoLabel: {
    color: "#64748b",
    fontSize: 13,
  },

  stack: {
    display: "grid",
    gap: 12,
  },

  line: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
  },

  lineValue: {
    color: "#1e3a8a",
  },

  notice: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.7,
  },

  actions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 18,
  },
};
