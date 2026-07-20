import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import {
  FaBan,
  FaCalendarAlt,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaSuitcaseRolling,
  FaUserFriends,
} from "react-icons/fa";

import PublicPageLayout from "../components/PublicPageLayout.jsx";
import {
  getStatusBadgeStyle,
  pageTheme,
} from "../components/publicPageTheme.js";
import { getCurrentUser } from "../api/auth.js";
import {
  cancelBookingById,
  getMyBookings,
} from "../api/bookings.js";

export default function MyTrips() {
  const navigate = useNavigate();

  const [bookings, setBookings] =
    useState([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");
  const [success, setSuccess] =
    useState("");
  const [search, setSearch] =
    useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [tripTypeFilter, setTripTypeFilter] =
    useState("all");
  const [busyId, setBusyId] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTrips() {
      try {
        const user = getCurrentUser();

        if (!user?._id) {
          navigate("/login", {
            replace: true,
          });
          return;
        }

        const data =
          await getMyBookings(
            user._id
          );

        if (!cancelled) {
          setBookings(
            Array.isArray(
              data?.bookings
            )
              ? data.bookings
              : []
          );
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError?.message ||
              "Could not load your trips."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTrips();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const filteredBookings =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      return bookings.filter(
        (booking) => {
          const searchText = [
            booking?.tripId?.title,
            booking?.tripId?.country,
            booking?.tripId?.tripType,
            booking?.tripId
              ?.transportation,
            booking?.bookingStatus,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const searchMatch =
            !normalizedSearch ||
            searchText.includes(
              normalizedSearch
            );

          const statusMatch =
            statusFilter ===
              "all" ||
            String(
              booking?.bookingStatus ||
                ""
            ).toLowerCase() ===
              statusFilter;

          const typeMatch =
            tripTypeFilter ===
              "all" ||
            String(
              booking?.tripId
                ?.tripType || ""
            ).toLowerCase() ===
              tripTypeFilter;

          return (
            searchMatch &&
            statusMatch &&
            typeMatch
          );
        }
      );
    }, [
      bookings,
      search,
      statusFilter,
      tripTypeFilter,
    ]);

  const statistics = useMemo(
    () => ({
      totalBookings:
        bookings.length,
      activeBookings:
        bookings.filter(
          (booking) =>
            booking.bookingStatus !==
            "cancelled"
        ).length,
      cancelledBookings:
        bookings.filter(
          (booking) =>
            booking.bookingStatus ===
            "cancelled"
        ).length,
      totalTravelers: bookings.reduce(
        (sum, booking) =>
          sum +
          Number(
            booking.travelers || 0
          ),
        0
      ),
      totalSpent: bookings.reduce(
        (sum, booking) =>
          sum +
          Number(
            booking.totalPrice || 0
          ),
        0
      ),
    }),
    [bookings]
  );

  async function handleCancelBooking(
    bookingId
  ) {
    if (!bookingId || busyId) {
      return;
    }

    try {
      setBusyId(bookingId);
      setError("");
      setSuccess("");

      const data =
        await cancelBookingById(
          bookingId
        );

      setBookings((current) =>
        current.map((booking) =>
          booking._id === bookingId
            ? {
                ...booking,
                bookingStatus:
                  data?.booking
                    ?.bookingStatus ||
                  "cancelled",
              }
            : booking
        )
      );

      setSuccess(
        data?.message ||
          "Booking cancelled successfully."
      );
    } catch (cancelError) {
      setError(
        cancelError?.message ||
          "Could not cancel your booking."
      );
    } finally {
      setBusyId("");
    }
  }

  return (
    <PublicPageLayout
      eyebrow="User"
      title="My Trips"
      subtitle="Manage your bookings with the same organized layout used in the traveler management area."
    >
      {error ? (
        <div style={pageTheme.errorBox}>
          {error}
        </div>
      ) : null}

      {success ? (
        <div style={pageTheme.successBox}>
          {success}
        </div>
      ) : null}

      <div style={pageTheme.cardGrid}>
        <StatisticCard
          icon={
            <FaSuitcaseRolling />
          }
          label="Bookings"
          value={
            statistics.totalBookings
          }
        />
        <StatisticCard
          icon={<FaCheckCircle />}
          label="Active"
          value={
            statistics.activeBookings
          }
        />
        <StatisticCard
          icon={<FaUserFriends />}
          label="Travelers"
          value={
            statistics.totalTravelers
          }
        />
        <StatisticCard
          icon={
            <FaMoneyBillWave />
          }
          label="Spent"
          value={formatMoney(
            statistics.totalSpent
          )}
        />
      </div>

      <div
        style={{
          ...pageTheme.surface,
          marginTop: 18,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
          }}
        >
          <label style={pageTheme.field}>
            <span>Search</span>
            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Trip, country, type, transport"
              style={pageTheme.control}
            />
          </label>

          <label style={pageTheme.field}>
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              style={pageTheme.control}
            >
              <option value="all">
                All statuses
              </option>
              <option value="paid">
                Paid
              </option>
              <option value="cancelled">
                Cancelled
              </option>
            </select>
          </label>

          <label style={pageTheme.field}>
            <span>Trip type</span>
            <select
              value={tripTypeFilter}
              onChange={(event) =>
                setTripTypeFilter(
                  event.target.value
                )
              }
              style={pageTheme.control}
            >
              <option value="all">
                All types
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
            </select>
          </label>
        </div>
      </div>

      <div
        style={{
          marginTop: 18,
          display: "grid",
          gap: 16,
        }}
      >
        {loading ? (
          <div style={pageTheme.emptyBox}>
            Loading your trips...
          </div>
        ) : filteredBookings.length ===
          0 ? (
          <div style={pageTheme.emptyBox}>
            No trips found.
          </div>
        ) : (
          filteredBookings.map(
            (booking) => {
              const trip =
                booking?.tripId || {};

              return (
                <div
                  key={
                    booking._id
                  }
                  style={{
                    ...pageTheme.surface,
                    padding: 20,
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "minmax(220px, 280px) 1fr",
                      gap: 18,
                    }}
                  >
                    <div
                      style={
                        styles.imageWrap
                      }
                    >
                      <img
                        src={
                          trip.photo ||
                          "/Images/Libanon233.jpg"
                        }
                        alt={
                          trip.title ||
                          "Trip"
                        }
                        style={
                          styles.image
                        }
                      />
                    </div>

                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          gap: 18,
                          flexWrap:
                            "wrap",
                        }}
                      >
                        <div>
                          <h2
                            style={{
                              margin:
                                "0 0 6px",
                              fontSize: 24,
                              fontWeight: 900,
                              color:
                                "#0f172a",
                            }}
                          >
                            {trip.title ||
                              "Trip unavailable"}
                          </h2>
                          <p
                            style={{
                              margin:
                                "0 0 8px",
                              color:
                                "#475569",
                            }}
                          >
                            {trip.country ||
                              "Destination not set"}
                          </p>
                          <div
                            style={{
                              display:
                                "flex",
                              gap: 10,
                              flexWrap:
                                "wrap",
                            }}
                          >
                            <span
                              style={getStatusBadgeStyle(
                                booking.bookingStatus
                              )}
                            >
                              {booking.bookingStatus ||
                                "Unknown"}
                            </span>
                            <span
                              style={pageTheme.pill}
                            >
                              Payment:{" "}
                              {booking.paymentStatus ||
                                "paid"}
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            textAlign:
                              "right",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 800,
                              color:
                                "#64748b",
                              textTransform:
                                "uppercase",
                              letterSpacing:
                                "0.06em",
                            }}
                          >
                            Booking total
                          </div>
                          <div
                            style={{
                              marginTop: 6,
                              fontSize: 26,
                              fontWeight: 900,
                              color:
                                "#0f172a",
                            }}
                          >
                            {formatMoney(
                              booking.totalPrice
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          ...pageTheme.divider,
                          margin:
                            "18px 0",
                        }}
                      />

                      <div
                        style={
                          styles.detailsGrid
                        }
                      >
                        <InfoTile
                          label="Trip type"
                          value={
                            trip.tripType ||
                            "Not set"
                          }
                        />
                        <InfoTile
                          label="Transportation"
                          value={
                            trip.transportation ||
                            "Not set"
                          }
                        />
                        <InfoTile
                          label="Travelers"
                          value={String(
                            booking.travelers ||
                              0
                          )}
                        />
                        <InfoTile
                          label="Duration"
                          value={formatDuration(
                            trip.duration
                          )}
                        />
                        <InfoTile
                          label="Trip date"
                          value={formatDate(
                            trip.date
                          )}
                        />
                        <InfoTile
                          label="Booked at"
                          value={formatDateTime(
                            booking.createdAt
                          )}
                        />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          gap: 12,
                          flexWrap:
                            "wrap",
                          alignItems:
                            "center",
                          marginTop: 18,
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            gap: 8,
                            flexWrap:
                              "wrap",
                          }}
                        >
                          <span
                            style={
                              pageTheme.pill
                            }
                          >
                            <FaMapMarkerAlt />
                            {trip.country ||
                              "Country"}
                          </span>
                          <span
                            style={
                              pageTheme.pill
                            }
                          >
                            <FaCalendarAlt />
                            {formatDate(
                              trip.date
                            )}
                          </span>
                        </div>

                        <div
                          style={
                            pageTheme.actions
                          }
                        >
                          {trip._id ? (
                            <Link
                              to={`/trips/${trip._id}`}
                              style={
                                pageTheme.buttonSecondary
                              }
                            >
                              View details
                            </Link>
                          ) : null}

                          {booking.bookingStatus !==
                          "cancelled" ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleCancelBooking(
                                  booking._id
                                )
                              }
                              disabled={
                                busyId ===
                                booking._id
                              }
                              style={{
                                ...pageTheme.buttonDanger,
                                opacity:
                                  busyId ===
                                  booking._id
                                    ? 0.7
                                    : 1,
                              }}
                            >
                              <FaBan />
                              {" "}
                              {busyId ===
                              booking._id
                                ? "Cancelling..."
                                : "Cancel booking"}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          )
        )}
      </div>
    </PublicPageLayout>
  );
}

function StatisticCard({
  icon,
  label,
  value,
}) {
  return (
    <div style={pageTheme.tile}>
      <div style={pageTheme.iconCircle}>
        {icon}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 800,
          color: "#64748b",
          textTransform:
            "uppercase",
          letterSpacing:
            "0.06em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 28,
          fontWeight: 900,
          color: "#0f172a",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function InfoTile({
  label,
  value,
}) {
  return (
    <div style={pageTheme.softSurface}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: "#64748b",
          textTransform:
            "uppercase",
          letterSpacing:
            "0.06em",
          marginBottom: 7,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 800,
          color: "#0f172a",
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function formatMoney(value) {
  const amount = Number(value || 0);

  return Number.isFinite(amount)
    ? `$${amount.toFixed(2)}`
    : "$0.00";
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleDateString();
}

function formatDateTime(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleString();
}

function formatDuration(value) {
  if (
    value &&
    typeof value === "object"
  ) {
    const amount = Number(
      value.value
    );
    const unit =
      String(
        value.unit || "days"
      ).trim() || "days";

    if (
      Number.isFinite(amount) &&
      amount > 0
    ) {
      return `${amount} ${unit}`;
    }
  }

  const amount = Number(value);

  return Number.isFinite(amount) &&
    amount > 0
    ? `${amount} day${amount === 1 ? "" : "s"}`
    : "Not set";
}

const styles = {
  imageWrap: {
    width: "100%",
    minHeight: 240,
    borderRadius: 22,
    overflow: "hidden",
    background:
      "rgba(191, 219, 254, 0.35)",
    border: "1px solid rgba(147, 197, 253, 0.4)",
    boxShadow:
      "0 16px 40px rgba(96, 165, 250, 0.16)",
  },

  image: {
    width: "100%",
    height: "100%",
    minHeight: 240,
    objectFit: "cover",
    display: "block",
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 12,
  },
};
