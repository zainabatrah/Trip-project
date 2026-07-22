import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  FaBan,
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
import { createAutoFitMinmax } from "../utils/responsive.js";
import {
  cancelBookingById,
  getManagedBookings,
} from "../api/bookings.js";

const API_ROOT = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

function formatDateTime(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleString();
}

function formatMoney(value) {
  const amount = Number(value || 0);

  return Number.isFinite(amount)
    ? `$${amount.toFixed(2)}`
    : "$0.00";
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

function resolveProfileImage(
  value
) {
  const image = String(
    value || ""
  ).trim();

  if (!image) {
    return "";
  }

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  return `${API_ROOT}${image.startsWith("/") ? image : `/${image}`}`;
}

function getTravelerName(
  booking
) {
  return (
    booking?.userId?.fullName ||
    booking?.userId?.name ||
    "Traveler"
  );
}

function getTravelerEmail(
  booking
) {
  return (
    booking?.userId?.email ||
    "Email not available"
  );
}

function buildSearchText(
  booking
) {
  return [
    getTravelerName(booking),
    getTravelerEmail(booking),
    booking?.userId?.country,
    booking?.tripId?.title,
    booking?.tripId?.country,
    booking?.tripId?.tripType,
    booking?.bookingStatus,
    booking?.paymentStatus,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
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

export default function ManageTravelers() {
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

    async function loadBookings() {
      try {
        const data =
          await getManagedBookings();

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
              "Could not load traveler bookings."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBookings();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredBookings =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      return bookings.filter(
        (booking) => {
          const searchMatch =
            !normalizedSearch ||
            buildSearchText(
              booking
            ).includes(
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
      totalRevenue: bookings.reduce(
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
          "Could not cancel the booking."
      );
    } finally {
      setBusyId("");
    }
  }

  return (
    <PublicPageLayout
      eyebrow="Organizer"
      title="Manage Travelers"
      subtitle="Review confirmed bookings, track traveler counts, and manage trip participation using the same project style."
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
          label="Revenue"
          value={formatMoney(
            statistics.totalRevenue
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
              createAutoFitMinmax(220),
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
              placeholder="Traveler, email, trip, country"
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
            Loading traveler bookings...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div style={pageTheme.emptyBox}>
            No traveler bookings found.
          </div>
        ) : (
          filteredBookings.map(
            (booking) => {
              const travelerName =
                getTravelerName(
                  booking
                );
              const travelerEmail =
                getTravelerEmail(
                  booking
                );
              const profileImage =
                resolveProfileImage(
                  booking?.userId
                    ?.profileImage
                );

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
                      display: "flex",
                      justifyContent:
                        "space-between",
                      gap: 18,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 14,
                        alignItems:
                          "center",
                        minWidth: 0,
                      }}
                    >
                      {profileImage ? (
                        <img
                          src={
                            profileImage
                          }
                          alt={
                            travelerName
                          }
                          style={
                            styles.avatar
                          }
                        />
                      ) : (
                        <div
                          style={
                            styles.avatarFallback
                          }
                        >
                          {travelerName
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      <div
                        style={{
                          minWidth: 0,
                        }}
                      >
                        <h2
                          style={{
                            margin:
                              "0 0 4px",
                            fontSize: 22,
                            fontWeight: 900,
                            color:
                              "#0f172a",
                          }}
                        >
                          {travelerName}
                        </h2>
                        <p
                          style={{
                            margin:
                              "0 0 6px",
                            color:
                              "#475569",
                            wordBreak:
                              "break-word",
                          }}
                        >
                          {
                            travelerEmail
                          }
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
                    style={styles.detailsGrid}
                  >
                    <InfoTile
                      label="Trip"
                      value={
                        booking?.tripId
                          ?.title ||
                        "Trip unavailable"
                      }
                    />
                    <InfoTile
                      label="Destination"
                      value={
                        booking?.tripId
                          ?.country ||
                        "Not set"
                      }
                    />
                    <InfoTile
                      label="Type"
                      value={
                        booking?.tripId
                          ?.tripType ||
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
                        booking?.tripId
                          ?.duration
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
                      flexWrap: "wrap",
                      alignItems:
                        "center",
                      marginTop: 18,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap:
                          "wrap",
                      }}
                    >
                      <span
                        style={pageTheme.pill}
                      >
                        <FaMapMarkerAlt />
                        {booking?.tripId
                          ?.country ||
                          "Country"}
                      </span>
                      <span
                        style={pageTheme.pill}
                      >
                        <FaSuitcaseRolling />
                        {booking?.tripId
                          ?.transportation ||
                          "Transport"}
                      </span>
                    </div>

                    <div
                      style={
                        pageTheme.actions
                      }
                    >
                      {booking?.tripId
                        ?._id ? (
                        <Link
                          to={`/trips/${booking.tripId._id}`}
                          style={
                            pageTheme.buttonSecondary
                          }
                        >
                          View trip
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
              );
            }
          )
        )}
      </div>
    </PublicPageLayout>
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

const styles = {
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 20,
    objectFit: "cover",
    border: "1px solid rgba(147, 197, 253, 0.45)",
    boxShadow:
      "0 12px 28px rgba(96, 165, 250, 0.18)",
    flexShrink: 0,
  },

  avatarFallback: {
    width: 60,
    height: 60,
    borderRadius: 20,
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(135deg, #93c5fd, #a78bfa)",
    color: "#ffffff",
    fontSize: 24,
    fontWeight: 900,
    boxShadow:
      "0 12px 28px rgba(96, 165, 250, 0.25)",
    flexShrink: 0,
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns:
      createAutoFitMinmax(160),
    gap: 12,
  },
};
