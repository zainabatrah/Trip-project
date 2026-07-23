import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import PublicPageLayout from "../components/PublicPageLayout.jsx";
import {
  pageTheme,
} from "../components/publicPageTheme.js";
import {
  createAutoFitMinmax,
  useCompactLayout,
} from "../utils/responsive.js";
import {
  getTrips,
} from "../api/trips.js";

const defaultTripImage =
  "/Images/Libanon233.jpg";

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

function formatDate(value) {
  if (!value) {
    return "Date unavailable";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Date unavailable";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }
  );
}

function getDateTimestamp(value) {
  if (!value) {
    return Number.MAX_SAFE_INTEGER;
  }

  const timestamp =
    new Date(value).getTime();

  return Number.isNaN(
    timestamp
  )
    ? Number.MAX_SAFE_INTEGER
    : timestamp;
}

function getDestinationName(trip) {
  const firstPlace =
    Array.isArray(
      trip?.places
    ) &&
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
  const savedPhoto =
    String(
      trip?.photo || ""
    ).trim();

  if (savedPhoto) {
    return savedPhoto;
  }

  return getDestinationImage(
    trip
  );
}

function TripImage({
  trip,
  compact = false,
  phone = false,
}) {
  const [
    image,
    setImage,
  ] = useState(() =>
    getInitialTripImage(trip)
  );

  function handleImageError(
    event
  ) {
    const destinationImage =
      getDestinationImage(
        trip
      );

    if (
      image !==
        destinationImage &&
      destinationImage !==
        defaultTripImage
    ) {
      setImage(
        destinationImage
      );

      return;
    }

    if (
      image !==
      defaultTripImage
    ) {
      setImage(
        defaultTripImage
      );

      return;
    }

    event.currentTarget.onerror =
      null;
  }

  return (
    <img
      src={image}
      alt={
        trip?.title ||
        getDestinationName(
          trip
        ) ||
        "Trip"
      }
      loading="lazy"
      style={
        compact
          ? {
              ...styles.image,
              ...styles.imageCompact,
              ...(phone
                ? styles.imagePhone
                : null),
            }
          : styles.image
      }
      onError={
        handleImageError
      }
    />
  );
}

function seatsLeft(trip) {
  const totalTravelers =
    Number(
      trip?.numberOfTravelers ||
        0
    );

  const reservedTravelers =
    Number(
      trip?.reservedTravelers ||
        0
    );

  return Math.max(
    totalTravelers -
      reservedTravelers,
    0
  );
}

function hasDatabaseId(trip) {
  return Boolean(
    String(
      trip?._id ||
        trip?.id ||
        ""
    ).trim()
  );
}

function buildMapLink(trip) {
  const tripId =
    trip?._id ||
    trip?.id;

  if (tripId) {
    return `/map/${tripId}`;
  }

  const firstPlace =
    Array.isArray(
      trip?.places
    )
      ? trip.places[0]
      : null;

  const destination =
    getDestinationName(
      trip
    );

  const params =
    new URLSearchParams();

  if (trip?.title) {
    params.set(
      "title",
      trip.title
    );
  }

  if (destination) {
    params.set(
      "city",
      destination
    );
  }

  const latitude =
    firstPlace?.latitude ??
    firstPlace?.lat;

  const longitude =
    firstPlace?.longitude ??
    firstPlace?.lng;

  if (
    latitude !== undefined &&
    latitude !== null &&
    longitude !== undefined &&
    longitude !== null
  ) {
    params.set(
      "lat",
      String(latitude)
    );

    params.set(
      "lng",
      String(longitude)
    );
  }

  const query =
    params.toString();

  return query
    ? `/map?${query}`
    : "/map";
}

export default function Trips() {
  const isCompact =
    useCompactLayout();
  const isPhone =
    useCompactLayout(640);
  const [
    trips,
    setTrips,
  ] = useState([]);
  const [
    search,
    setSearch,
  ] = useState("");
  const [
    transportation,
    setTransportation,
  ] = useState("all");
  const [
    sort,
    setSort,
  ] = useState("date");
  const [
    loading,
    setLoading,
  ] = useState(true);
  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTrips() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getTrips();

        if (cancelled) {
          return;
        }

        const receivedTrips =
          Array.isArray(
            data?.trips
          )
            ? data.trips
            : [];

        setTrips(
          receivedTrips.filter(
            hasDatabaseId
          )
        );
      } catch (
        requestError
      ) {
        if (cancelled) {
          return;
        }

        console.error(
          "Could not load trips:",
          requestError
        );

        setError(
          requestError?.response
            ?.data?.message ||
            requestError?.message ||
            "Could not load trips."
        );

        setTrips([]);
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
  }, []);

  const filteredTrips =
    useMemo(() => {
      const query =
        normalizeText(search);

      let result =
        trips.filter(
          (trip) => {
            const placesText =
              Array.isArray(
                trip?.places
              )
                ? trip.places
                    .map(
                      (place) =>
                        place?.city
                    )
                    .join(" ")
                : "";

            const searchableText =
              normalizeText(
                [
                  trip?.title,
                  trip?.country,
                  trip?.from,
                  trip?.to,
                  trip?.destination,
                  trip?.tripType,
                  placesText,
                ].join(" ")
              );

            const searchMatch =
              !query ||
              searchableText.includes(
                query
              );

            const tripTransportation =
              normalizeText(
                trip?.transportation
              );

            const transportationMatch =
              transportation ===
                "all" ||
              tripTransportation ===
                normalizeText(
                  transportation
                );

            return (
              searchMatch &&
              transportationMatch
            );
          }
        );

      if (
        sort === "price-low"
      ) {
        result =
          [...result].sort(
            (
              first,
              second
            ) =>
              Number(
                first?.price || 0
              ) -
              Number(
                second?.price || 0
              )
          );
      }

      if (
        sort === "price-high"
      ) {
        result =
          [...result].sort(
            (
              first,
              second
            ) =>
              Number(
                second?.price || 0
              ) -
              Number(
                first?.price || 0
              )
          );
      }

      if (sort === "date") {
        const statusPriority = {
          ongoing: 0,
          planned: 1,
          completed: 2,
        };

        result =
          [...result].sort(
            (
              first,
              second
            ) => {
              const firstStatus =
                normalizeText(
                  first?.status
                );

              const secondStatus =
                normalizeText(
                  second?.status
                );

              const firstPriority =
                statusPriority[
                  firstStatus
                ] ?? 99;

              const secondPriority =
                statusPriority[
                  secondStatus
                ] ?? 99;

              if (
                firstPriority !==
                secondPriority
              ) {
                return (
                  firstPriority -
                  secondPriority
                );
              }

              return (
                getDateTimestamp(
                  first?.date
                ) -
                getDateTimestamp(
                  second?.date
                )
              );
            }
          );
      }

      if (
        sort === "rating"
      ) {
        result =
          [...result].sort(
            (
              first,
              second
            ) => {
              const firstRating =
                Number(
                  first?.rating ||
                    0
                );

              const secondRating =
                Number(
                  second?.rating ||
                    0
                );

              if (
                firstRating === 0 &&
                secondRating > 0
              ) {
                return 1;
              }

              if (
                secondRating === 0 &&
                firstRating > 0
              ) {
                return -1;
              }

              return (
                secondRating -
                firstRating
              );
            }
          );
      }

      return result;
    }, [
      trips,
      search,
      transportation,
      sort,
    ]);

  return (
    <PublicPageLayout
      title="Explore Our Trips"
      subtitle="Browse available trips, destinations, dates, and transportation options."
    >
      <section
        style={
          pageTheme.surface
        }
      >
        <div
          style={
            styles.filters
          }
        >
          <label
            style={
              pageTheme.field
            }
          >
            <span>
              Search
            </span>

            <input
              type="search"
              value={search}
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
              placeholder="Search trips..."
              style={
                pageTheme.control
              }
            />
          </label>

          <label
            style={
              pageTheme.field
            }
          >
            <span>
              Transportation
            </span>

            <select
              value={
                transportation
              }
              onChange={(
                event
              ) =>
                setTransportation(
                  event.target
                    .value
                )
              }
              style={
                pageTheme.control
              }
            >
              <option value="all">
                All transportation
              </option>

              <option value="bus">
                Bus
              </option>

              <option value="car">
                Car
              </option>

              <option value="flight">
                Flight
              </option>

              <option value="boat">
                Boat
              </option>
            </select>
          </label>

          <label
            style={
              pageTheme.field
            }
          >
            <span>
              Sort by
            </span>

            <select
              value={sort}
              onChange={(
                event
              ) =>
                setSort(
                  event.target
                    .value
                )
              }
              style={
                pageTheme.control
              }
            >
              <option value="date">
                Nearest Upcoming
              </option>

              <option value="rating">
                Highest Rated
              </option>

              <option value="price-low">
                Lowest Price
              </option>

              <option value="price-high">
                Highest Price
              </option>
            </select>
          </label>
        </div>
      </section>

      {error && (
        <div
          style={{
            ...pageTheme.errorBox,
            marginTop: 18,
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div
          style={{
            ...pageTheme.emptyBox,
            marginTop: 18,
          }}
        >
          Loading trips...
        </div>
      ) : filteredTrips.length ===
        0 ? (
        <div
          style={{
            ...pageTheme.emptyBox,
            marginTop: 18,
          }}
        >
          No trips found.
        </div>
      ) : (
        <section
          style={{
            ...pageTheme.surface,
            marginTop: 18,
          }}
        >
          <div
            style={
              styles.resultsBar
            }
          >
            <div>
              <h2
                style={
                  styles.resultsTitle
                }
              >
                Available trips
              </h2>

              <p
                style={
                  styles.resultsText
                }
              >
                Open a trip for full details or jump to the map directly from the card.
              </p>
            </div>

            <span
              style={
                pageTheme.pill
              }
            >
              {
                filteredTrips.length
              }{" "}
              visible
            </span>
          </div>

          <div
            style={
              styles.list
            }
          >
            {filteredTrips.map(
              (trip) => {
                const id =
                  trip._id ||
                  trip.id;

                const status =
                  normalizeText(
                    trip.status
                  );

                const destination =
                  getDestinationName(
                    trip
                  ) ||
                  "Lebanon";

                const startingPoint =
                  String(
                    trip?.from ||
                      ""
                  ).trim();

                const route =
                  startingPoint
                    ? `${startingPoint} → ${destination}`
                    : destination;

                const rating =
                  Number(
                    trip.rating ||
                      0
                  );

                return (
                  <article
                    key={id}
                    style={{
                      ...styles.card,
                      ...(isCompact
                        ? styles.cardCompact
                        : null),
                      ...(isPhone
                        ? styles.cardPhone
                        : null),
                    }}
                  >
                    <div
                      style={{
                        ...styles.imageSection,
                        ...(isCompact
                          ? styles.imageSectionCompact
                          : null),
                        ...(isPhone
                          ? styles.imageSectionPhone
                          : null),
                      }}
                    >
                      <TripImage
                        key={[
                          id,
                          trip?.photo || "",
                          trip?.to || "",
                          trip?.country || "",
                        ].join(":")}
                        trip={trip}
                        compact={isCompact}
                        phone={isPhone}
                      />

                      {status ===
                      "completed" ? (
                        <Link
                          to={`/feedback/${id}`}
                          style={{
                            ...styles.commentsButton,
                            ...(isPhone
                              ? styles.commentsButtonPhone
                              : null),
                          }}
                        >
                          💬 Reviews
                        </Link>
                      ) : (
                        <div
                          style={{
                            ...styles.commentsDisabled,
                            ...(isPhone
                              ? styles.commentsDisabledPhone
                              : null),
                          }}
                        >
                          💬 Reviews available
                          after trip
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        ...styles.body,
                        ...(isCompact
                          ? styles.bodyCompact
                          : null),
                        ...(isPhone
                          ? styles.bodyPhone
                          : null),
                      }}
                    >
                      <div
                        style={
                          styles.mainInfo
                        }
                      >
                        <div
                          style={{
                            ...styles.titleRow,
                            ...(isPhone
                              ? styles.titleRowPhone
                              : null),
                          }}
                        >
                          <h2
                            style={{
                              ...styles.title,
                              ...(isPhone
                                ? styles.titlePhone
                                : null),
                            }}
                          >
                            {trip.title ||
                              "Untitled Trip"}
                          </h2>

                          <span
                            style={{
                              ...styles.statusBadge,
                              ...(status ===
                              "completed"
                                ? styles.completed
                                : status ===
                                    "ongoing"
                                  ? styles.ongoing
                                  : styles.planned),
                            }}
                          >
                            {status
                              ? status.toUpperCase()
                              : "UNKNOWN"}
                          </span>
                        </div>

                        <p
                          style={{
                            ...styles.route,
                            ...(isPhone
                              ? styles.routePhone
                              : null),
                          }}
                        >
                          {route}
                        </p>

                        <div
                          style={{
                            ...styles.details,
                            ...(isPhone
                              ? styles.detailsPhone
                              : null),
                          }}
                        >
                          <span
                            style={{
                              ...styles.detailItem,
                              ...(isPhone
                                ? styles.detailItemPhone
                                : null),
                            }}
                          >
                            📅{" "}
                            {formatDate(
                              trip.date
                            )}
                          </span>

                          {rating > 0 ? (
                            <span
                              style={{
                                ...styles.detailItem,
                                ...(isPhone
                                  ? styles.detailItemPhone
                                  : null),
                              }}
                            >
                              ⭐{" "}
                              {rating.toFixed(
                                1
                              )}
                            </span>
                          ) : (
                            <span
                              style={{
                                ...styles.detailItem,
                                ...(isPhone
                                  ? styles.detailItemPhone
                                  : null),
                              }}
                            >
                              ⭐ No reviews yet
                            </span>
                          )}

                          <span
                            style={{
                              ...styles.detailItem,
                              ...(isPhone
                                ? styles.detailItemPhone
                                : null),
                            }}
                          >
                            💰 $
                            {Number(
                              trip.price ||
                                0
                            ).toFixed(2)}
                          </span>

                          <span
                            style={{
                              ...styles.detailItem,
                              ...(isPhone
                                ? styles.detailItemPhone
                                : null),
                            }}
                          >
                            🚗{" "}
                            {capitalize(
                              trip.transportation
                            )}
                          </span>

                          <span
                            style={{
                              ...styles.detailItem,
                              ...(isPhone
                                ? styles.detailItemPhone
                                : null),
                            }}
                          >
                            🧳{" "}
                            {seatsLeft(
                              trip
                            )}{" "}
                            seats left
                          </span>
                        </div>

                        <div
                          style={{
                            ...styles.actions,
                            ...(isPhone
                              ? styles.actionsPhone
                              : null),
                          }}
                        >
                          <Link
                            to={`/trips/${id}`}
                            style={{
                              ...pageTheme.buttonSecondary,
                              ...styles.actionButton,
                              ...(isCompact
                                ? styles.actionButtonCompact
                                : null),
                              ...(isPhone
                                ? styles.actionButtonPhone
                                : null),
                            }}
                          >
                            Trip Details
                          </Link>

                          <Link
                            to={
                              buildMapLink(
                                trip
                              )
                            }
                            style={{
                              ...pageTheme.buttonSecondary,
                              ...styles.actionButton,
                              ...(isCompact
                                ? styles.actionButtonCompact
                                : null),
                              ...(isPhone
                                ? styles.actionButtonPhone
                                : null),
                            }}
                          >
                            Open Map
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        </section>
      )}
    </PublicPageLayout>
  );
}

const styles = {
  filters: {
    width: "100%",
    minWidth: 0,

    display: "grid",

    gridTemplateColumns:
      createAutoFitMinmax(220),

    gap: 16,
  },

  resultsBar: {
    width: "100%",
    minWidth: 0,

    display: "flex",

    justifyContent:
      "space-between",

    alignItems:
      "flex-start",

    gap: 16,
    flexWrap: "wrap",

    marginBottom: 18,
  },

  resultsTitle: {
    maxWidth: "100%",

    margin: "0 0 6px",

    fontSize: 20,
    fontWeight: 900,

    color: "#1e3a8a",

    overflowWrap:
      "anywhere",
  },

  resultsText: {
    maxWidth: "100%",

    margin: 0,

    color: "#475569",
    lineHeight: 1.7,

    overflowWrap:
      "anywhere",
  },

  list: {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,

    display: "flex",
    flexDirection: "column",

    gap: 18,
  },

  /*
   * flex-wrap makes the body move below the
   * image automatically on small screens,
   * even before the JavaScript breakpoint runs.
   */
  card: {
    display: "flex",
    alignItems: "stretch",
    flexWrap: "wrap",

    width: "100%",
    maxWidth: "100%",
    minWidth: 0,

    background:
      "rgba(255,255,255,0.8)",

    border:
      "1px solid #bfdbfe",

    borderRadius: 18,

    overflow: "hidden",

    boxShadow:
      "0 12px 30px rgba(96,165,250,0.15)",

    boxSizing: "border-box",
  },

  cardCompact: {
    flexDirection: "column",
    flexWrap: "nowrap",

    width: "100%",
    minWidth: 0,
  },

  cardPhone: {
    width: "100%",
    maxWidth: "100%",

    borderRadius: 16,
  },

  imageSection: {
    /*
     * On laptop this remains approximately 230px.
     * On a narrow phone it grows to the card width.
     */
    flex: "1 1 230px",

    width: 230,
    maxWidth: "100%",
    minWidth: 0,

    display: "flex",
    flexDirection: "column",

    boxSizing: "border-box",
  },

  imageSectionCompact: {
    flex:
      "0 0 100%",

    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
  },

  imageSectionPhone: {
    width: "100%",
    maxWidth: "100%",
  },

  image: {
    display: "block",

    width: "100%",
    maxWidth: "100%",
    height: 200,

    objectFit: "cover",
    objectPosition: "center",

    flexShrink: 0,
  },

  imageCompact: {
    width: "100%",
    height:
      "clamp(190px, 56vw, 220px)",
  },

  imagePhone: {
    width: "100%",
    height:
      "clamp(180px, 58vw, 210px)",
  },

  commentsButton: {
    display: "flex",

    alignItems: "center",
    justifyContent: "center",

    width: "100%",
    maxWidth: "100%",
    minWidth: 0,

    gap: 8,

    padding: 12,

    background: "#f8fbff",

    borderTop:
      "1px solid #dbeafe",

    color: "#2563eb",

    textDecoration: "none",
    textAlign: "center",

    fontWeight: 700,
    lineHeight: 1.45,

    boxSizing: "border-box",

    whiteSpace: "normal",
    overflowWrap: "anywhere",
  },

  commentsDisabled: {
    display: "flex",

    justifyContent: "center",
    alignItems: "center",

    width: "100%",
    maxWidth: "100%",
    minWidth: 0,

    padding: 12,

    background: "#f8fafc",

    color: "#94a3b8",

    borderTop:
      "1px solid #e2e8f0",

    fontSize: 14,
    fontWeight: 600,

    textAlign: "center",
    lineHeight: 1.45,

    boxSizing: "border-box",

    whiteSpace: "normal",
    overflowWrap: "anywhere",
  },

  commentsButtonPhone: {
    width: "100%",
    minHeight: 48,

    padding:
      "11px 14px",
  },

  commentsDisabledPhone: {
    width: "100%",
    minHeight: 48,

    padding:
      "11px 14px",
  },

  /*
   * A large flex basis forces the body below
   * the image when there is not enough space.
   */
  body: {
    flex:
      "999 1 360px",

    width: "auto",
    maxWidth: "100%",
    minWidth: 0,

    display: "flex",

    justifyContent:
      "space-between",

    alignItems:
      "stretch",

    padding: 22,

    boxSizing: "border-box",
  },

  bodyCompact: {
    flex:
      "0 0 100%",

    width: "100%",
    maxWidth: "100%",
    minWidth: 0,

    flexDirection: "column",

    gap: 16,

    padding:
      "clamp(16px, 4vw, 18px)",
  },

  bodyPhone: {
    width: "100%",
    maxWidth: "100%",

    gap: 14,

    padding:
      "clamp(14px, 4vw, 17px)",
  },

  mainInfo: {
    flex: 1,

    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
  },

  titleRow: {
    display: "flex",

    alignItems: "center",

    width: "100%",
    minWidth: 0,

    gap: 12,
    flexWrap: "wrap",

    marginBottom: 6,
  },

  titleRowPhone: {
    alignItems:
      "flex-start",

    gap: 10,
  },

  title: {
    flex: "1 1 180px",

    maxWidth: "100%",
    minWidth: 0,

    margin: "5px 0",

    fontSize:
      "clamp(20px, 5vw, 23px)",

    fontWeight: 900,

    color: "#1e3a8a",

    lineHeight: 1.2,

    overflowWrap:
      "anywhere",

    wordBreak: "break-word",
  },

  titlePhone: {
    width: "100%",

    margin: "2px 0",

    fontSize:
      "clamp(19px, 5.8vw, 21px)",
  },

  route: {
    maxWidth: "100%",

    margin:
      "5px 0 15px",

    color: "#2563eb",
    fontWeight: 700,

    lineHeight: 1.5,

    overflowWrap:
      "anywhere",

    wordBreak: "break-word",
  },

  routePhone: {
    margin:
      "4px 0 14px",
  },

  details: {
    display: "flex",
    flexWrap: "wrap",

    width: "100%",
    maxWidth: "100%",
    minWidth: 0,

    gap: 15,

    color: "#475569",

    marginBottom: 18,

    fontSize: 14,
    lineHeight: 1.5,
  },

  detailsPhone: {
    flexDirection:
      "column",

    alignItems:
      "stretch",

    gap: 10,

    marginBottom: 16,
  },

  detailItem: {
    flex:
      "0 1 auto",

    maxWidth: "100%",
    minWidth: 0,

    overflowWrap:
      "anywhere",

    wordBreak: "break-word",
  },

  detailItemPhone: {
    display: "block",
    width: "100%",
  },

  statusBadge: {
    flexShrink: 0,

    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",

    maxWidth: "100%",

    padding:
      "6px 12px",

    borderRadius: 20,

    fontSize: 12,
    fontWeight: 800,

    color: "#ffffff",

    textTransform:
      "uppercase",

    letterSpacing:
      "0.5px",

    textAlign: "center",

    whiteSpace: "normal",
    overflowWrap: "anywhere",

    boxSizing: "border-box",
  },

  planned: {
    background: "#3b8ce9",
  },

  ongoing: {
    background: "#f59e0b",
  },

  completed: {
    background: "#dc2626",
  },

  actions: {
    display: "grid",

    gridTemplateColumns:
      createAutoFitMinmax(145),

    width: "100%",
    maxWidth: "100%",
    minWidth: 0,

    gap: 12,

    marginTop: 18,
  },

  actionsPhone: {
    gridTemplateColumns:
      "1fr",

    gap: 10,

    marginTop: 16,
  },

  actionButton: {
    display:
      "inline-flex",

    alignItems:
      "center",

    justifyContent:
      "center",
    width: "100%",
    minWidth: 0,

    minHeight: 44,

    padding:
      "10px 18px",

    borderRadius: 12,

    textDecoration:
      "none",

    textAlign: "center",

    fontWeight: 800,

    boxSizing:
      "border-box",

    whiteSpace: "normal",
    overflowWrap: "anywhere",
  },

  actionButtonCompact: {
    width: "100%",

    flex:
      "1 1 100%",

    boxSizing:
      "border-box",
  },

  actionButtonPhone: {
    width: "100%",
    minHeight: 46,
  },
};
