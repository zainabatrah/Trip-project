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
  getTrips,
} from "../api/trips.js";

const defaultTripImage =
  "/Images/Libanon233.jpg";

/*
|--------------------------------------------------------------------------
| Frontend image selection
|--------------------------------------------------------------------------
|
| The backend normally returns the
| resolved image in trip.photo.
|
| This frontend helper still checks all
| places before using the final default.
|
*/

function getTripCardImage(trip) {
  const savedPhoto =
    String(
      trip?.photo ||
      ""
    ).trim();

  if (savedPhoto) {
    return savedPhoto;
  }

  const places =
    Array.isArray(
      trip?.places
    )
      ? trip.places
      : [];

  const savedPlaceImage =
    places
      .map(
        (place) =>
          String(
            place?.image ||
            ""
          ).trim()
      )
      .find(Boolean);

  return (
    savedPlaceImage ||
    defaultTripImage
  );
}

function formatDate(value) {
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
      weekday:
        "short",

      month:
        "short",

      day:
        "numeric",

      year:
        "numeric",

      timeZone:
        "UTC",
    }
  );
}

function capitalize(value) {
  const text =
    String(
      value ||
      ""
    );

  return text
    ? text
        .charAt(0)
        .toUpperCase() +
        text.slice(1)
    : "Not specified";
}

function seatsLeft(trip) {
  const isApprovedPrivateTrip =
    String(
      trip?.from ||
      ""
    ).trim() ===
      "Private Pickup" ||
    (
      Array.isArray(
        trip?.inclusions
      ) &&
      trip.inclusions.includes(
        "Approved private trip"
      )
    );

  if (
    isApprovedPrivateTrip
  ) {
    return 0;
  }

  return Math.max(
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

function formatDuration(
  duration
) {
  if (
    duration &&
    typeof duration ===
      "object"
  ) {
    const value =
      Number(
        duration.value ??
        duration.amount ??
        duration.days ??
        duration.hours
      );

    const unit =
      String(
        duration.unit ||
        (
          duration.hours !==
          undefined
            ? "hours"
            : "days"
        )
      ).trim();

    if (
      Number.isFinite(
        value
      ) &&
      value > 0
    ) {
      return `${value} ${unit}`;
    }
  }

  const value =
    Number(duration);

  if (
    Number.isFinite(
      value
    ) &&
    value > 0
  ) {
    return `${value} day(s)`;
  }

  return "Duration unavailable";
}

function buildMapLink(trip) {
  const firstPlace =
    Array.isArray(
      trip.places
    )
      ? trip.places[0]
      : null;

  const params =
    new URLSearchParams();

  if (
    trip.title
  ) {
    params.set(
      "title",
      trip.title
    );
  }

  if (
    trip.to
  ) {
    params.set(
      "city",
      trip.to
    );
  }

  if (
    firstPlace?.latitude !==
      undefined &&
    firstPlace?.longitude !==
      undefined
  ) {
    params.set(
      "lat",
      String(
        firstPlace.latitude
      )
    );

    params.set(
      "lng",
      String(
        firstPlace.longitude
      )
    );
  }

  const query =
    params.toString();

  return query
    ? `/map?${query}`
    : "/map";
}

export default function Trips() {
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
  ] = useState(
    "all"
  );

  const [
    sort,
    setSort,
  ] = useState(
    "date"
  );

  const [
    loading,
    setLoading,
  ] = useState(
    true
  );

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    let cancelled =
      false;

    async function loadTrips() {
      try {
        setLoading(
          true
        );

        setError("");

        const data =
          await getTrips();

        if (
          !cancelled
        ) {
          setTrips(
            Array.isArray(
              data?.trips
            )
              ? data.trips.filter(
                  hasDatabaseId
                )
              : []
          );
        }
      } catch (
        requestError
      ) {
        if (
          !cancelled
        ) {
          setError(
            requestError.message ||
            "Could not load trips."
          );

          setTrips([]);
        }
      } finally {
        if (
          !cancelled
        ) {
          setLoading(
            false
          );
        }
      }
    }

    loadTrips();

    return () => {
      cancelled =
        true;
    };
  }, []);

  const filteredTrips =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      let result =
        trips.filter(
          (trip) => {
            const searchableText =
              [
                trip.title,
                trip.country,
                trip.from,
                trip.to,
                trip.tripType,
              ]
                .join(" ")
                .toLowerCase();

            const matchesSearch =
              searchableText.includes(
                query
              );

            const matchesTransportation =
              transportation ===
                "all" ||
              trip.transportation ===
                transportation;

            return (
              matchesSearch &&
              matchesTransportation
            );
          }
        );

      if (
        sort ===
        "price-low"
      ) {
        result =
          [...result].sort(
            (
              first,
              second
            ) =>
              Number(
                first.price ||
                0
              ) -
              Number(
                second.price ||
                0
              )
          );
      }

      if (
        sort ===
        "price-high"
      ) {
        result =
          [...result].sort(
            (
              first,
              second
            ) =>
              Number(
                second.price ||
                0
              ) -
              Number(
                first.price ||
                0
              )
          );
      }

      if (
        sort ===
        "date"
      ) {
        result =
          [...result].sort(
            (
              first,
              second
            ) =>
              new Date(
                first.date
              ) -
              new Date(
                second.date
              )
          );
      }

      if (
        sort ===
        "latest"
      ) {
        result =
          [...result].sort(
            (
              first,
              second
            ) =>
              new Date(
                second.createdAt
              ) -
              new Date(
                first.createdAt
              )
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
      eyebrow="Trip Collection"
      title="Trips Inside Lebanon"
      subtitle="Browse available trips, destinations, dates, and transportation options."
      headerAction={
        <div
          style={
            styles.headerCard
          }
        >
          <strong
            style={
              styles.headerValue
            }
          >
            {
              filteredTrips.length
            }
          </strong>

          <span
            style={
              styles.headerLabel
            }
          >
            trips shown
          </span>
        </div>
      }
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
              value={
                search
              }
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
              <option
                value="all"
              >
                All transportation
              </option>

              <option
                value="flight"
              >
                Flight
              </option>

              <option
                value="train"
              >
                Train
              </option>

              <option
                value="bus"
              >
                Bus
              </option>

              <option
                value="car"
              >
                Car
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
              value={
                sort
              }
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
              <option
                value="date"
              >
                Nearest date
              </option>

              <option
                value="latest"
              >
                Latest added
              </option>

              <option
                value="price-low"
              >
                Lowest price
              </option>

              <option
                value="price-high"
              >
                Highest price
              </option>
            </select>
          </label>
        </div>
      </section>

      {error && (
        <div
          style={{
            ...pageTheme.errorBox,
            marginTop:
              18,
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div
          style={{
            ...pageTheme.emptyBox,
            marginTop:
              18,
          }}
        >
          Loading trips...
        </div>
      ) : filteredTrips.length ===
        0 ? (
        <div
          style={{
            ...pageTheme.emptyBox,
            marginTop:
              18,
          }}
        >
          No trips found.
        </div>
      ) : (
        <section
          style={{
            ...pageTheme.surface,
            marginTop:
              18,
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
              styles.grid
            }
          >
            {filteredTrips.map(
              (trip) => {
                const id =
                  trip._id ||
                  trip.id;

                const image =
                  getTripCardImage(
                    trip
                  );

                return (
                  <article
                    key={
                      id
                    }
                    style={
                      styles.card
                    }
                  >
                    <img
                      src={
                        image
                      }
                      alt={
                        trip.title ||
                        "Trip"
                      }
                      loading="lazy"
                      style={
                        styles.image
                      }
                      onError={(
                        event
                      ) => {
                        event
                          .currentTarget
                          .onerror =
                          null;

                        event
                          .currentTarget
                          .src =
                          defaultTripImage;
                      }}
                    />

                    <div
                      style={
                        styles.body
                      }
                    >
                      <div
                        style={
                          styles.tags
                        }
                      >
                        <span
                          style={
                            pageTheme.pill
                          }
                        >
                          {capitalize(
                            trip.tripType
                          )}
                        </span>

                        <span
                          style={
                            pageTheme.pill
                          }
                        >
                          {capitalize(
                            trip.status
                          )}
                        </span>
                      </div>

                      <h2
                        style={
                          styles.title
                        }
                      >
                        {
                          trip.title
                        }
                      </h2>

                      <p
                        style={
                          styles.route
                        }
                      >
                        {
                          trip.from
                        }{" "}
                        →{" "}
                        {
                          trip.to
                        }
                      </p>

                      <p
                        style={
                          styles.description
                        }
                      >
                        {
                          trip.description ||
                          "No description available."
                        }
                      </p>

                      <div
                        style={
                          styles.details
                        }
                      >
                        <span>
                          {formatDate(
                            trip.date
                          )}
                        </span>

                        <span>
                          {formatDuration(
                            trip.duration
                          )}
                        </span>

                        <span>
                          {capitalize(
                            trip.transportation
                          )}
                        </span>

                        <span>
                          Rating:{" "}
                          {Number(
                            trip.rating ||
                            0
                          ).toFixed(
                            1
                          )}
                          /5
                        </span>
                      </div>

                      <div
                        style={
                          styles.bottom
                        }
                      >
                        <strong
                          style={
                            styles.price
                          }
                        >
                          $
                          {Number(
                            trip.price ||
                            0
                          ).toFixed(
                            2
                          )}
                        </strong>

                        <span
                          style={
                            styles.seats
                          }
                        >
                          {seatsLeft(
                            trip
                          )}{" "}
                          seats left
                        </span>
                      </div>

                      <div
                        style={
                          styles.actions
                        }
                      >
                        <Link
                          to={`/trips/${id}`}
                          style={{
                            ...pageTheme.buttonPrimary,
                            ...styles.actionButton,
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
                          }}
                        >
                          Open Map
                        </Link>
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
  headerCard: {
    minWidth:
      140,

    padding:
      "18px 20px",

    borderRadius:
      18,

    background:
      "rgba(255, 255, 255, 0.72)",

    border:
      "1px solid rgba(147, 197, 253, 0.45)",

    boxShadow:
      "0 12px 30px rgba(96, 165, 250, 0.18)",

    display:
      "grid",

    gap:
      4,

    textAlign:
      "center",
  },

  headerValue: {
    fontSize:
      28,

    color:
      "#1e3a8a",
  },

  headerLabel: {
    color:
      "#64748b",

    fontSize:
      13,

    fontWeight:
      800,

    textTransform:
      "uppercase",

    letterSpacing:
      "0.06em",
  },

  filters: {
    display:
      "grid",

    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",

    gap:
      16,
  },

  resultsBar: {
    display:
      "flex",

    justifyContent:
      "space-between",

    gap:
      16,

    alignItems:
      "flex-start",

    flexWrap:
      "wrap",

    marginBottom:
      18,
  },

  resultsTitle: {
    margin:
      "0 0 6px",

    fontSize:
      20,

    fontWeight:
      900,

    color:
      "#1e3a8a",
  },

  resultsText: {
    margin:
      0,

    color:
      "#475569",

    lineHeight:
      1.7,
  },

  grid: {
    display:
      "grid",

    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",

    gap:
      22,
  },

  card: {
    display:
      "flex",

    flexDirection:
      "column",

    minHeight:
      "100%",

    overflow:
      "hidden",

    borderRadius:
      18,

    background:
      "rgba(255, 255, 255, 0.72)",

    border:
      "1px solid #bfdbfe",

    boxShadow:
      "0 18px 44px rgba(96, 165, 250, 0.16)",

    backdropFilter:
      "blur(16px)",

    WebkitBackdropFilter:
      "blur(16px)",
  },

  image: {
    width:
      "100%",

    height:
      210,

    objectFit:
      "cover",
  },

  body: {
    display:
      "flex",

    flexDirection:
      "column",

    flex:
      1,

    padding:
      22,

    boxSizing:
      "border-box",
  },

  tags: {
    display:
      "flex",

    justifyContent:
      "space-between",

    gap:
      10,

    flexWrap:
      "wrap",
  },

  title: {
    margin:
      "14px 0 8px",

    fontSize:
      22,

    fontWeight:
      900,

    color:
      "#1e3a8a",
  },

  route: {
    margin:
      "0 0 12px",

    fontWeight:
      700,

    color:
      "#2563eb",
  },

  description: {
    margin:
      0,

    color:
      "#475569",

    lineHeight:
      1.7,

    minHeight:
      72,
  },

  details: {
    display:
      "grid",

    gap:
      7,

    margin:
      "16px 0",

    color:
      "#475569",

    minHeight:
      90,
  },

  bottom: {
    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    gap:
      12,

    flexWrap:
      "wrap",

    marginBottom:
      16,
  },

  price: {
    fontSize:
      20,

    color:
      "#1e3a8a",
  },

  seats: {
    color:
      "#475569",

    fontWeight:
      700,
  },

  actions: {
    display:
      "grid",

    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",

    gap:
      10,

    marginTop:
      "auto",
  },

  actionButton: {
    display:
      "block",

    textAlign:
      "center",
  },
};