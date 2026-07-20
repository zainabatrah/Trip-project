import { useEffect, useState } from "react";
import {
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { getTripById } from "../api/trips.js";

const startIcon = new L.DivIcon({
  className: "",
  iconSize: [55, 25],
  iconAnchor: [27, 25],
  html: `
    <div style="
      background:#16a34a;
      color:white;
      padding:4px 8px;
      border-radius:15px;
      font-size:10px;
      font-weight:bold;
      border:2px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.25);
    ">
      🟢 START
    </div>
  `,
});

const endIcon = new L.DivIcon({
  className: "",
  iconSize: [55, 25],
  iconAnchor: [27, 25],
  html: `
    <div style="
      background:#dc2626;
      color:white;
      padding:4px 8px;
      border-radius:15px;
      font-size:10px;
      font-weight:bold;
      border:2px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.25);
    ">
      🔴 END
    </div>
  `,
});

function toCoordinate(value) {
  const parsedValue =
    Number(value);

  return Number.isFinite(
    parsedValue
  )
    ? parsedValue
    : null;
}

function buildPoint(
  name,
  latitude,
  longitude
) {
  const lat =
    toCoordinate(latitude);
  const lng =
    toCoordinate(longitude);

  if (
    lat === null ||
    lng === null
  ) {
    return null;
  }

  return {
    name:
      String(name || "").trim() ||
      "Stop",
    lat,
    lng,
  };
}

function getTripPoints(trip) {
  const placePoints =
    Array.isArray(
      trip?.places
    )
      ? trip.places
          .map((place) =>
            buildPoint(
              place?.city,
              place?.latitude ??
                place?.lat,
              place?.longitude ??
                place?.lng
            )
          )
          .filter(Boolean)
      : [];

  if (placePoints.length > 0) {
    return placePoints;
  }

  const points = [];

  const startPoint =
    buildPoint(
      trip?.from,
      trip?.fromLocation?.lat,
      trip?.fromLocation?.lng
    );

  if (startPoint) {
    points.push(startPoint);
  }

  if (
    Array.isArray(
      trip?.stops
    )
  ) {
    for (const stop of trip.stops) {
      const stopPoint =
        buildPoint(
          stop?.name,
          stop?.lat,
          stop?.lng
        );

      if (stopPoint) {
        points.push(stopPoint);
      }
    }
  }

  const endPoint =
    buildPoint(
      trip?.to,
      trip?.toLocation?.lat,
      trip?.toLocation?.lng
    );

  if (endPoint) {
    points.push(endPoint);
  }

  return points;
}

function buildFallbackTrip(
  rawSearch
) {
  const searchParams =
    new URLSearchParams(
      rawSearch
    );

  const lat =
    toCoordinate(
      searchParams.get("lat")
    );
  const lng =
    toCoordinate(
      searchParams.get("lng")
    );

  if (
    lat === null ||
    lng === null
  ) {
    return null;
  }

  const city =
    String(
      searchParams.get("city") ||
        ""
    ).trim() || "Destination";

  const title =
    String(
      searchParams.get("title") ||
        ""
    ).trim() || city;

  return {
    title,
    from: city,
    to: city,
    date: "",
    transportation: "",
    duration: "",
    numberOfTravelers: "",
    places: [
      {
        city,
        latitude: lat,
        longitude: lng,
      },
    ],
  };
}

function formatDateLabel(
  value
) {
  if (!value) {
    return "Date not set";
  }

  const date =
    new Date(value);

  return Number.isNaN(
    date.getTime()
  )
    ? "Date not set"
    : date.toLocaleDateString();
}

function formatDurationLabel(
  value
) {
  const duration =
    typeof value === "object"
      ? value?.value
      : value;

  return Number.isFinite(
    Number(duration)
  ) &&
    Number(duration) > 0
    ? `⏱ ${duration} Days`
    : "⏱ Duration not set";
}

function formatTravelersLabel(
  value
) {
  return Number.isFinite(
    Number(value)
  ) &&
    Number(value) > 0
    ? `👥 ${value} Travelers`
    : "👥 Travelers not set";
}

function FitBounds({
  points,
}) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) {
      return;
    }

    if (points.length === 1) {
      map.setView(
        points[0],
        13
      );

      return;
    }

    map.fitBounds(
      L.latLngBounds(points),
      {
        padding: [50, 50],
      }
    );
  }, [points, map]);

  return null;
}

export default function Map() {
  const { tripId } =
    useParams();
  const [
    searchParams,
  ] = useSearchParams();
  const searchKey =
    searchParams.toString();

  const [trip, setTrip] =
    useState(null);
  const [
    roadRoute,
    setRoadRoute,
  ] = useState([]);
  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled =
      false;

    async function loadTrip() {
      setError("");
      setRoadRoute([]);

      if (!tripId) {
        const fallbackTrip =
          buildFallbackTrip(
            searchKey
          );

        setTrip(fallbackTrip);

        if (!fallbackTrip) {
          setError(
            "Trip location is unavailable."
          );
        }

        return;
      }

      try {
        const data =
          await getTripById(
            tripId
          );

        if (cancelled) {
          return;
        }

        if (!data?.trip) {
          setTrip(null);
          setError(
            "Trip not found."
          );

          return;
        }

        setTrip(data.trip);
      } catch (
        loadError
      ) {
        if (cancelled) {
          return;
        }

        console.error(
          loadError
        );

        const fallbackTrip =
          buildFallbackTrip(
            searchKey
          );

        if (fallbackTrip) {
          setTrip(fallbackTrip);
          return;
        }

        setTrip(null);
        setError(
          loadError?.message ||
            "Could not load map."
        );
      }
    }

    loadTrip();

    return () => {
      cancelled = true;
    };
  }, [tripId, searchKey]);

  useEffect(() => {
    let cancelled =
      false;

    async function getRoad() {
      const tripPoints =
        getTripPoints(trip);

      if (
        tripPoints.length < 2
      ) {
        setRoadRoute([]);
        return;
      }

      const points =
        tripPoints.map(
          (point) =>
            `${point.lng},${point.lat}`
        );

      const url =
        `https://router.project-osrm.org/route/v1/driving/${points.join(";")}?overview=full&geometries=geojson`;

      try {
        const response =
          await fetch(url);
        const data =
          await response.json();

        if (cancelled) {
          return;
        }

        if (
          data.routes?.length
        ) {
          const coordinates =
            data.routes[0].geometry.coordinates.map(
              (
                point
              ) => [
                point[1],
                point[0],
              ]
            );

          setRoadRoute(
            coordinates
          );
          return;
        }

        setRoadRoute([]);
      } catch (
        routeError
      ) {
        if (cancelled) {
          return;
        }

        console.error(
          routeError
        );
        setRoadRoute([]);
      }
    }

    getRoad();

    return () => {
      cancelled = true;
    };
  }, [trip]);

  if (!trip && !error) {
    return (
      <div
        style={{
          padding: "30px",
        }}
      >
        <h2>
          Loading map...
        </h2>
      </div>
    );
  }

  if (!trip) {
    return (
      <div
        style={{
          padding: "30px",
        }}
      >
        <h2>{error}</h2>
      </div>
    );
  }

  const tripPoints =
    getTripPoints(trip);

  if (
    tripPoints.length === 0
  ) {
    return (
      <div
        style={{
          padding: "30px",
        }}
      >
        <h2>
          Trip location is unavailable.
        </h2>
      </div>
    );
  }

  const from = [
    tripPoints[0].lat,
    tripPoints[0].lng,
  ];

  const to = [
    tripPoints[
      tripPoints.length - 1
    ].lat,
    tripPoints[
      tripPoints.length - 1
    ].lng,
  ];

  const validStops =
    tripPoints.slice(1, -1);

  const allPoints =
    tripPoints.map(
      (point) => [
        point.lat,
        point.lng,
      ]
    );

  const hasSeparateEnd =
    tripPoints.length > 1;

  return (
    <div
      style={{
        background:
          "#eff6ff",
        minHeight: "100vh",
        padding: "25px",
      }}
    >
      <div
        style={{
          background:
            "white",
          padding: "20px",
          borderRadius:
            "22px",
          marginBottom:
            "20px",
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.12)",
        }}
      >
        <h1
          style={{
            margin: 0,
            color: "#0369a1",
          }}
        >
          {trip.title}
        </h1>

        <h3>
          📍 {trip.from} → {trip.to}
        </h3>

        <p>
          <b>Stops:</b>{" "}
          {validStops.length > 0
            ? validStops
                .map(
                  (
                    stop
                  ) =>
                    stop.name
                )
                .join(" • ")
            : "Direct trip"}
        </p>
      </div>

      <div
        style={{
          height: "600px",
          borderRadius:
            "25px",
          overflow: "hidden",
          boxShadow:
            "0 15px 40px rgba(0,0,0,0.2)",
        }}
      >
        <MapContainer
          center={from}
          zoom={10}
          style={{
            height: "100%",
            width: "100%",
          }}
        >
          <FitBounds
            points={allPoints}
          />

          <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <Marker
            position={from}
            icon={startIcon}
          />

          {validStops.map(
            (
              stop,
              index
            ) => {
              const icon =
                new L.DivIcon({
                  className:
                    "",
                  iconSize: [
                    25,
                    25,
                  ],
                  iconAnchor: [
                    12,
                    12,
                  ],
                  html: `
                    <div style="
                      background:#2563eb;
                      color:white;
                      width:25px;
                      height:25px;
                      border-radius:50%;
                      display:flex;
                      align-items:center;
                      justify-content:center;
                      font-size:11px;
                      font-weight:bold;
                      border:2px solid white;
                      box-shadow:0 2px 6px rgba(0,0,0,0.3);
                    ">
                      ${index + 1}
                    </div>
                  `,
                });

              return (
                <Marker
                  key={`${stop.name}-${index}`}
                  position={[
                    stop.lat,
                    stop.lng,
                  ]}
                  icon={icon}
                />
              );
            }
          )}

          {hasSeparateEnd ? (
            <Marker
              position={to}
              icon={endIcon}
            />
          ) : null}

          {roadRoute.length >
          0 ? (
            <Polyline
              positions={
                roadRoute
              }
              weight={5}
            />
          ) : null}
        </MapContainer>
      </div>

      <div
        style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
          marginTop: "20px",
        }}
      >
        {[
          `🚌 ${
            trip.transportation ||
            "Transportation not set"
          }`,
          `📅 ${formatDateLabel(
            trip.date
          )}`,
          formatDurationLabel(
            trip.duration
          ),
          formatTravelersLabel(
            trip.numberOfTravelers
          ),
        ].map(
          (
            item,
            index
          ) => (
            <div
              key={index}
              style={{
                background:
                  "white",
                padding:
                  "15px 25px",
                borderRadius:
                  "20px",
                boxShadow:
                  "0 8px 20px rgba(0,0,0,0.1)",
                fontWeight:
                  "600",
              }}
            >
              {item}
            </div>
          )
        )}
      </div>
    </div>
  );
}
