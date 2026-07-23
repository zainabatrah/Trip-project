import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaPlus,
  FaRoute,
  FaStar,
  FaSuitcaseRolling,
} from "react-icons/fa";

import PublicPageLayout from "../components/PublicPageLayout.jsx";
import {
  pageTheme,
} from "../components/publicPageTheme.js";
import {
  createAutoFitMinmax,
  useCompactLayout,
} from "../utils/responsive.js";
import {
  createTrip,
  deleteTrip,
  getTrips,
  updateTrip,
} from "../api/trips.js";

const DEFAULT_TRIP_IMAGE =
  "/Images/Libanon233.jpg";

const TRANSPORTATION_OPTIONS = [
  "flight",
  "train",
  "bus",
  "car",
];

const STATUS_OPTIONS = [
  "planned",
  "ongoing",
  "completed",
];

const TYPE_OPTIONS = [
  "adventure",
  "relax",
  "business",
  "family",
];

function createEmptyPlace() {
  return {
    city: "",
    image: "",
    latitude: "",
    longitude: "",
    days: "1",
    unit: "days",
  };
}

function createEmptyForm() {
  return {
    title: "",
    country: "Lebanon",
    from: "",
    to: "",
    date: "",
    description: "",
    photo: "",
    price: "0",
    durationValue: "1",
    durationUnit: "days",
    numberOfTravelers: "20",
    reservedTravelers: "0",
    status: "planned",
    transportation: "bus",
    tripType: "adventure",
    rating: "0",
    inclusionsText: "",
    places: [createEmptyPlace()],
  };
}

function formatDateForInput(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function toDurationFormState(
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

    return {
      value: String(
        durationValue ??
          1
      ),
      unit:
        String(
          value.unit ||
            (value.hours !==
            undefined
              ? "hours"
              : fallbackUnit)
        )
          .trim()
          .toLowerCase() ===
        "hours"
          ? "hours"
          : "days",
    };
  }

  if (
    value !== undefined &&
    value !== null &&
    value !== ""
  ) {
    return {
      value: String(value),
      unit: fallbackUnit,
    };
  }

  return {
    value: "1",
    unit: fallbackUnit,
  };
}

function toFormState(trip) {
  const places =
    Array.isArray(trip?.places) &&
    trip.places.length > 0
      ? trip.places.map((place) => {
          const duration =
            toDurationFormState(
              place?.duration ??
                place?.days ??
                1
            );

          return {
            city: place?.city || "",
            image:
              place?.image || "",
            latitude:
              place?.latitude ?? "",
            longitude:
              place?.longitude ?? "",
            days:
              duration.value,
            unit:
              duration.unit,
          };
        })
      : [createEmptyPlace()];

  const tripDuration =
    toDurationFormState(
      trip?.duration ?? 1
    );

  return {
    title: trip?.title || "",
    country: trip?.country || "Lebanon",
    from: trip?.from || "",
    to: trip?.to || "",
    date: formatDateForInput(
      trip?.date
    ),
    description:
      trip?.description || "",
    photo: trip?.photo || "",
    price: String(trip?.price ?? 0),
    durationValue:
      tripDuration.value,
    durationUnit:
      tripDuration.unit,
    numberOfTravelers: String(
      trip?.numberOfTravelers ?? 1
    ),
    reservedTravelers: String(
      trip?.reservedTravelers ?? 0
    ),
    status: trip?.status || "planned",
    transportation:
      trip?.transportation ||
      "bus",
    tripType:
      trip?.tripType ||
      "adventure",
    rating: String(
      trip?.rating ?? 0
    ),
    inclusionsText: Array.isArray(
      trip?.inclusions
    )
      ? trip.inclusions.join("\n")
      : "",
    places,
  };
}

function sortTripsByDate(trips) {
  return [...trips].sort(
    (first, second) =>
      new Date(second.date) -
      new Date(first.date)
  );
}

function formatCardDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No date";
  }

  return date.toLocaleDateString();
}

function capitalize(value) {
  const text = String(
    value || ""
  );

  return text
    ? text.charAt(0).toUpperCase() +
        text.slice(1)
    : "Not set";
}

function getSeatsLeft(trip) {
  return Math.max(
    Number(
      trip?.numberOfTravelers || 0
    ) -
      Number(
        trip?.reservedTravelers || 0
      ),
    0
  );
}

function parseInclusions(text) {
  return String(text || "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildPlacesPayload(
  places,
  fallbackImage
) {
  return places
    .map((place) => ({
      city: String(
        place?.city || ""
      ).trim(),
      image: String(
        place?.image || ""
      ).trim(),
      latitude: String(
        place?.latitude ?? ""
      ).trim(),
      longitude: String(
        place?.longitude ?? ""
      ).trim(),
      days: String(
        place?.days ?? ""
      ).trim(),
      unit:
        String(
          place?.unit || "days"
        ).trim() || "days",
    }))
    .filter((place) =>
      [
        place.city,
        place.image,
        place.latitude,
        place.longitude,
        place.days,
      ].some(Boolean)
    )
    .map((place) => ({
      city: place.city,
      image:
        place.image ||
        fallbackImage ||
        DEFAULT_TRIP_IMAGE,
      latitude: Number(
        place.latitude
      ),
      longitude: Number(
        place.longitude
      ),
      duration: {
        value: Number(place.days),
        unit:
          place.unit === "hours"
            ? "hours"
            : "days",
      },
    }));
}

function validateForm(form) {
  const requiredFields = [
    ["title", form.title],
    ["country", form.country],
    ["from", form.from],
    ["to", form.to],
    ["date", form.date],
  ];

  for (const [label, value] of requiredFields) {
    if (!String(value || "").trim()) {
      return `${label} is required.`;
    }
  }

  if (
    Number(form.price) < 0 ||
    !Number.isFinite(
      Number(form.price)
    )
  ) {
    return "Price must be a non-negative number.";
  }

  if (
    Number(form.durationValue) < 0 ||
    !Number.isFinite(
      Number(
        form.durationValue
      )
    )
  ) {
    return "Duration must be a non-negative number.";
  }

  if (
    ![
      "days",
      "hours",
    ].includes(
      String(
        form.durationUnit || ""
      ).toLowerCase()
    )
  ) {
    return "Duration unit must be days or hours.";
  }

  if (
    !Number.isInteger(
      Number(form.numberOfTravelers)
    ) ||
    Number(form.numberOfTravelers) < 1
  ) {
    return "Number of travelers must be at least 1.";
  }

  if (
    !Number.isInteger(
      Number(form.reservedTravelers)
    ) ||
    Number(form.reservedTravelers) < 0
  ) {
    return "Reserved travelers must be 0 or more.";
  }

  if (
    Number(form.rating) < 0 ||
    Number(form.rating) > 5 ||
    !Number.isFinite(
      Number(form.rating)
    )
  ) {
    return "Rating must be between 0 and 5.";
  }

  const places =
    buildPlacesPayload(
      form.places,
      form.photo
    );

  for (const place of places) {
    if (!place.city) {
      return "Each stop needs a city name.";
    }

    if (
      !Number.isFinite(
        place.duration.value
      ) ||
      place.duration.value < 0
    ) {
      return "Each stop needs a valid stay duration.";
    }
  }

  return "";
}

function buildTripPayload(form) {
  return {
    title: form.title.trim(),
    country: form.country.trim(),
    from: form.from.trim(),
    to: form.to.trim(),
    date: form.date,
    description:
      form.description.trim(),
    photo: form.photo.trim(),
    price: Number(form.price),
    duration: {
      value: Number(
        form.durationValue
      ),
      unit:
        form.durationUnit ===
        "hours"
          ? "hours"
          : "days",
    },
    numberOfTravelers: Number(
      form.numberOfTravelers
    ),
    reservedTravelers: Number(
      form.reservedTravelers
    ),
    status: form.status,
    transportation:
      form.transportation,
    tripType: form.tripType,
    rating: Number(form.rating),
    inclusions: parseInclusions(
      form.inclusionsText
    ),
    places: buildPlacesPayload(
      form.places,
      form.photo
    ),
  };
}

export default function ManageTrips() {
  const isCompact =
    useCompactLayout();
  const [trips, setTrips] = useState([]);
  const [form, setForm] = useState(
    createEmptyForm()
  );
  const [
    selectedTripId,
    setSelectedTripId,
  ] = useState("");
  const [search, setSearch] =
    useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [deleting, setDeleting] =
    useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTrips() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getTrips();

        if (!cancelled) {
          setTrips(
            sortTripsByDate(
              Array.isArray(
                data?.trips
              )
                ? data.trips
                : []
            )
          );
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.message ||
              "Could not load trips."
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
  }, []);

  const filteredTrips =
    useMemo(() => {
      const query = search
        .trim()
        .toLowerCase();

      return trips.filter((trip) => {
        const matchesSearch =
          [
            trip.title,
            trip.country,
            trip.from,
            trip.to,
            trip.tripType,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query);

        const matchesStatus =
          statusFilter === "all" ||
          trip.status ===
            statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      });
    }, [
      search,
      statusFilter,
      trips,
    ]);

  const statistics = useMemo(
    () => ({
      total: trips.length,
      planned: trips.filter(
        (trip) =>
          trip.status ===
          "planned"
      ).length,
      ongoing: trips.filter(
        (trip) =>
          trip.status ===
          "ongoing"
      ).length,
      completed: trips.filter(
        (trip) =>
          trip.status ===
          "completed"
      ).length,
    }),
    [trips]
  );

  const isEditing =
    Boolean(selectedTripId);

  function handleFieldChange(
    field,
    value
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handlePlaceChange(
    index,
    field,
    value
  ) {
    setForm((current) => ({
      ...current,
      places: current.places.map(
        (place, placeIndex) =>
          placeIndex === index
            ? {
                ...place,
                [field]: value,
              }
            : place
      ),
    }));
  }

  function addPlace() {
    setForm((current) => ({
      ...current,
      places: [
        ...current.places,
        createEmptyPlace(),
      ],
    }));
  }

  function removePlace(index) {
    setForm((current) => ({
      ...current,
      places:
        current.places.length === 1
          ? [createEmptyPlace()]
          : current.places.filter(
              (_place, placeIndex) =>
                placeIndex !== index
            ),
    }));
  }

  function startNewTrip() {
    setSelectedTripId("");
    setForm(createEmptyForm());
    setError("");
    setSuccess(
      "Ready to create a new trip."
    );
  }

  function startEditingTrip(trip) {
    setSelectedTripId(
      trip._id || trip.id
    );
    setForm(toFormState(trip));
    setError("");
    setSuccess(
      `Editing ${trip.title}.`
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving || deleting) {
      return;
    }

    const validationError =
      validateForm(form);

    if (validationError) {
      setError(validationError);
      setSuccess("");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload =
        buildTripPayload(form);

      const data = isEditing
        ? await updateTrip(
            selectedTripId,
            payload
          )
        : await createTrip(payload);

      const nextTrip =
        data?.trip;

      if (!nextTrip) {
        throw new Error(
          "Trip data was not returned."
        );
      }

      setTrips((current) =>
        sortTripsByDate(
          isEditing
            ? current.map((trip) =>
                (trip._id || trip.id) ===
                selectedTripId
                  ? nextTrip
                  : trip
              )
            : [nextTrip, ...current]
        )
      );

      setSelectedTripId(
        nextTrip._id || nextTrip.id
      );
      setForm(toFormState(nextTrip));
      setSuccess(
        data.message ||
          (isEditing
            ? "Trip updated."
            : "Trip created.")
      );
    } catch (requestError) {
      setError(
        requestError.message ||
          "Could not save the trip."
      );
      setSuccess("");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (
      !selectedTripId ||
      deleting ||
      saving
    ) {
      return;
    }

    const currentTrip =
      trips.find(
        (trip) =>
          (trip._id || trip.id) ===
          selectedTripId
      );

    const confirmed =
      window.confirm(
        `Delete ${currentTrip?.title || "this trip"}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      const data =
        await deleteTrip(
          selectedTripId
        );

      setTrips((current) =>
        current.filter(
          (trip) =>
            (trip._id || trip.id) !==
            selectedTripId
        )
      );

      setSelectedTripId("");
      setForm(createEmptyForm());
      setSuccess(
        data?.message ||
          "Trip deleted successfully."
      );
    } catch (requestError) {
      setError(
        requestError.message ||
          "Could not delete the trip."
      );
      setSuccess("");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <PublicPageLayout
      eyebrow="Organizer Studio"
      title="Trip Studio"
      subtitle="Design new trips, refine existing journeys, and keep the full catalog under one organizer workspace."
      maxWidth={1260}
      headerAction={
        <div style={styles.headerCard}>
          <strong style={styles.headerValue}>
            {statistics.total}
          </strong>
          <span style={styles.headerLabel}>
            trips in catalog
          </span>
        </div>
      }
    >
      <div style={styles.statsGrid}>
        <StatCard
          icon={<FaSuitcaseRolling />}
          label="Planned"
          value={statistics.planned}
          accent="rgba(250, 204, 21, 0.16)"
        />
        <StatCard
          icon={<FaRoute />}
          label="Ongoing"
          value={statistics.ongoing}
          accent="rgba(96, 165, 250, 0.18)"
        />
        <StatCard
          icon={<FaStar />}
          label="Completed"
          value={statistics.completed}
          accent="rgba(74, 222, 128, 0.16)"
        />
      </div>

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

      <div
        style={{
          ...styles.layout,
          ...(isCompact
            ? styles.layoutCompact
            : null),
        }}
      >
        <section style={styles.formColumn}>
          <form
            onSubmit={handleSubmit}
            style={pageTheme.surface}
          >
            <div style={styles.formTopBar}>
              <div>
                <h2 style={styles.sectionTitle}>
                  {isEditing
                    ? "Edit Trip"
                    : "Create Trip"}
                </h2>
                <p style={styles.sectionText}>
                  Core trip details and itinerary stops live here.
                </p>
              </div>

              <button
                type="button"
                onClick={startNewTrip}
                disabled={saving || deleting}
                style={{
                  ...pageTheme.buttonSecondary,
                  opacity:
                    saving || deleting
                      ? 0.7
                      : 1,
                }}
              >
                <FaPlus />
                {" "}
                New Trip
              </button>
            </div>

            <div style={styles.formGrid}>
              <Field
                label="Title"
                value={form.title}
                onChange={(value) =>
                  handleFieldChange(
                    "title",
                    value
                  )
                }
              />
              <Field
                label="Country"
                value={form.country}
                onChange={(value) =>
                  handleFieldChange(
                    "country",
                    value
                  )
                }
              />
              <Field
                label="From"
                value={form.from}
                onChange={(value) =>
                  handleFieldChange(
                    "from",
                    value
                  )
                }
              />
              <Field
                label="To"
                value={form.to}
                onChange={(value) =>
                  handleFieldChange(
                    "to",
                    value
                  )
                }
              />
              <Field
                label="Date"
                type="date"
                value={form.date}
                onChange={(value) =>
                  handleFieldChange(
                    "date",
                    value
                  )
                }
              />
              <Field
                label="Cover image path"
                value={form.photo}
                placeholder="/Images/Batroun.jpg or https://..."
                onChange={(value) =>
                  handleFieldChange(
                    "photo",
                    value
                  )
                }
              />
              <SelectField
                label="Status"
                value={form.status}
                options={STATUS_OPTIONS}
                onChange={(value) =>
                  handleFieldChange(
                    "status",
                    value
                  )
                }
              />
              <SelectField
                label="Transportation"
                value={
                  form.transportation
                }
                options={
                  TRANSPORTATION_OPTIONS
                }
                onChange={(value) =>
                  handleFieldChange(
                    "transportation",
                    value
                  )
                }
              />
              <SelectField
                label="Trip type"
                value={form.tripType}
                options={TYPE_OPTIONS}
                onChange={(value) =>
                  handleFieldChange(
                    "tripType",
                    value
                  )
                }
              />
              <Field
                label="Price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(value) =>
                  handleFieldChange(
                    "price",
                    value
                  )
                }
              />
              <Field
                label="Duration"
                type="number"
                min="0"
                step="1"
                value={
                  form.durationValue
                }
                onChange={(value) =>
                  handleFieldChange(
                    "durationValue",
                    value
                  )
                }
              />
              <SelectField
                label="Duration unit"
                value={
                  form.durationUnit
                }
                options={[
                  "days",
                  "hours",
                ]}
                onChange={(value) =>
                  handleFieldChange(
                    "durationUnit",
                    value
                  )
                }
              />
              <Field
                label="Travelers"
                type="number"
                min="1"
                step="1"
                value={
                  form.numberOfTravelers
                }
                onChange={(value) =>
                  handleFieldChange(
                    "numberOfTravelers",
                    value
                  )
                }
              />
              <Field
                label="Reserved"
                type="number"
                min="0"
                step="1"
                value={
                  form.reservedTravelers
                }
                onChange={(value) =>
                  handleFieldChange(
                    "reservedTravelers",
                    value
                  )
                }
              />
              <Field
                label="Rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={(value) =>
                  handleFieldChange(
                    "rating",
                    value
                  )
                }
              />
            </div>

            <label style={pageTheme.field}>
              <span>Description</span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  handleFieldChange(
                    "description",
                    event.target.value
                  )
                }
                placeholder="Describe the full experience, mood, and highlights."
                style={{
                  ...pageTheme.control,
                  ...pageTheme.textarea,
                }}
              />
            </label>

            <label style={pageTheme.field}>
              <span>Inclusions</span>
              <textarea
                value={
                  form.inclusionsText
                }
                onChange={(event) =>
                  handleFieldChange(
                    "inclusionsText",
                    event.target.value
                  )
                }
                placeholder="One inclusion per line"
                style={{
                  ...pageTheme.control,
                  minHeight: 110,
                }}
              />
            </label>

            <section
              style={{
                ...pageTheme.softSurface,
                marginTop: 10,
              }}
            >
              <div style={styles.placeHeader}>
                <div>
                  <h3 style={pageTheme.smallTitle}>
                    Itinerary Stops
                  </h3>
                  <p style={styles.inlineHint}>
                    Add cities for map and weather support. If the image is empty, the trip cover will be reused.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addPlace}
                  style={
                    pageTheme.buttonSecondary
                  }
                >
                  <FaPlus />
                  {" "}
                  Add Stop
                </button>
              </div>

              <div
                style={{
                  ...styles.placeGrid,
                  marginBottom: 18,
                }}
              >
                <Field
                  label="Destination"
                  value={form.to}
                  onChange={(value) =>
                    handleFieldChange(
                      "to",
                      value
                    )
                  }
                />
                <Field
                  label="Price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(value) =>
                    handleFieldChange(
                      "price",
                      value
                    )
                  }
                />
                <Field
                  label="Duration"
                  type="number"
                  min="0"
                  step="1"
                  value={
                    form.durationValue
                  }
                  onChange={(value) =>
                    handleFieldChange(
                      "durationValue",
                      value
                    )
                  }
                />
                <SelectField
                  label="Duration unit"
                  value={
                    form.durationUnit
                  }
                  options={[
                    "days",
                    "hours",
                  ]}
                  onChange={(value) =>
                    handleFieldChange(
                      "durationUnit",
                      value
                    )
                  }
                />
                <SelectField
                  label="Travel"
                  value={
                    form.transportation
                  }
                  options={
                    TRANSPORTATION_OPTIONS
                  }
                  onChange={(value) =>
                    handleFieldChange(
                      "transportation",
                      value
                    )
                  }
                />
                <Field
                  label="Nb of seats"
                  type="number"
                  min="1"
                  step="1"
                  value={
                    form.numberOfTravelers
                  }
                  onChange={(value) =>
                    handleFieldChange(
                      "numberOfTravelers",
                      value
                    )
                  }
                />
                <SelectField
                  label="Status"
                  value={form.status}
                  options={STATUS_OPTIONS}
                  onChange={(value) =>
                    handleFieldChange(
                      "status",
                      value
                    )
                  }
                />
              </div>

              <label
                style={{
                  ...pageTheme.field,
                  marginBottom: 18,
                }}
              >
                <span>Description</span>
                <textarea
                  value={
                    form.description
                  }
                  onChange={(event) =>
                    handleFieldChange(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Describe the trip for this itinerary."
                  style={{
                    ...pageTheme.control,
                    ...pageTheme.textarea,
                  }}
                />
              </label>

              <div style={styles.placesList}>
                {form.places.map(
                  (place, index) => (
                    <div
                      key={`place-${index}`}
                      style={styles.placeCard}
                    >
                      <div style={styles.placeCardHeader}>
                        <strong>
                          Stop {index + 1}
                        </strong>

                        <button
                          type="button"
                          onClick={() =>
                            removePlace(
                              index
                            )
                          }
                          style={
                            styles.placeDelete
                          }
                        >
                          Remove
                        </button>
                      </div>

                      <div style={styles.placeGrid}>
                        <Field
                          label="City"
                          value={place.city}
                          onChange={(value) =>
                            handlePlaceChange(
                              index,
                              "city",
                              value
                            )
                          }
                        />
                        <Field
                          label="Image path"
                          value={place.image}
                          placeholder="/Images/Faraya.jpg"
                          onChange={(value) =>
                            handlePlaceChange(
                              index,
                              "image",
                              value
                            )
                          }
                        />
                        <Field
                          label="Stay value"
                          type="number"
                          min="0"
                          step="1"
                          value={place.days}
                          onChange={(value) =>
                            handlePlaceChange(
                              index,
                              "days",
                              value
                            )
                          }
                        />
                        <SelectField
                          label="Stay unit"
                          value={place.unit}
                          options={[
                            "days",
                            "hours",
                          ]}
                          onChange={(value) =>
                            handlePlaceChange(
                              index,
                              "unit",
                              value
                            )
                          }
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>

            <div style={styles.formActions}>
              <button
                type="submit"
                disabled={saving || deleting}
                style={{
                  ...pageTheme.buttonPrimary,
                  opacity:
                    saving || deleting
                      ? 0.7
                      : 1,
                }}
              >
                {saving
                  ? "Saving..."
                  : isEditing
                    ? "Update Trip"
                    : "Create Trip"}
              </button>

              {isEditing ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={
                    saving || deleting
                  }
                  style={{
                    ...pageTheme.buttonDanger,
                    opacity:
                      saving || deleting
                        ? 0.7
                        : 1,
                  }}
                >
                  {deleting
                    ? "Deleting..."
                    : "Delete Trip"}
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <aside style={styles.sidebar}>
          <section style={pageTheme.surface}>
            <h2 style={styles.sectionTitle}>
              Live Preview
            </h2>

            <div style={styles.previewCard}>
              <div style={styles.previewBadge}>
                {capitalize(
                  form.tripType
                )}
              </div>

              <h3 style={styles.previewTitle}>
                {form.title ||
                  "Untitled journey"}
              </h3>

              <p style={styles.previewRoute}>
                {form.from || "Origin"} →{" "}
                {form.to ||
                  "Destination"}
              </p>

              <div style={styles.previewMeta}>
                <PreviewRow
                  icon={
                    <FaCalendarAlt />
                  }
                  label="Departure"
                  value={
                    form.date ||
                    "Pick a date"
                  }
                />
                <PreviewRow
                  icon={
                    <FaMapMarkerAlt />
                  }
                  label="Country"
                  value={
                    form.country ||
                    "Set country"
                  }
                />
                <PreviewRow
                  icon={<FaRoute />}
                  label="Stops"
                  value={String(
                    form.places.filter(
                      (place) =>
                        String(
                          place.city || ""
                        ).trim()
                    ).length
                  )}
                />
              </div>

              <div style={styles.previewFooter}>
                <strong>
                  $
                  {Number(
                    form.price || 0
                  ).toFixed(2)}
                </strong>
                <span>
                  {Math.max(
                    Number(
                      form.numberOfTravelers ||
                        0
                    ) -
                      Number(
                        form.reservedTravelers ||
                          0
                      ),
                    0
                  )}{" "}
                  seats available
                </span>
              </div>
            </div>
          </section>

          <section
            style={{
              ...pageTheme.surface,
              marginTop: 18,
            }}
          >
            <div style={styles.catalogTop}>
              <div>
                <h2
                  style={
                    styles.sectionTitle
                  }
                >
                  Catalog
                </h2>
                <p
                  style={
                    styles.sectionText
                  }
                >
                  Select a trip card to edit it.
                </p>
              </div>

              <span style={pageTheme.pill}>
                {filteredTrips.length} shown
              </span>
            </div>

            <div style={styles.catalogFilters}>
              <label style={pageTheme.field}>
                <span>Search</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search title or route"
                  style={
                    pageTheme.control
                  }
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
                  style={
                    pageTheme.control
                  }
                >
                  <option value="all">
                    All statuses
                  </option>

                  {STATUS_OPTIONS.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {capitalize(
                          status
                        )}
                      </option>
                    )
                  )}
                </select>
              </label>
            </div>

            {loading ? (
              <div
                style={{
                  ...pageTheme.emptyBox,
                  marginTop: 6,
                }}
              >
                Loading trips...
              </div>
            ) : filteredTrips.length ===
              0 ? (
              <div
                style={{
                  ...pageTheme.emptyBox,
                  marginTop: 6,
                }}
              >
                No trips match the current filter.
              </div>
            ) : (
              <div style={styles.tripList}>
                {filteredTrips.map(
                  (trip) => {
                    const tripId =
                      trip._id ||
                      trip.id;

                    const active =
                      tripId ===
                      selectedTripId;

                    return (
                      <article
                        key={tripId}
                        style={{
                          ...styles.tripCard,
                          borderColor:
                            active
                              ? "#60a5fa"
                              : "rgba(147, 197, 253, 0.45)",
                          boxShadow:
                            active
                              ? "0 18px 36px rgba(59, 130, 246, 0.22)"
                              : "0 12px 30px rgba(96, 165, 250, 0.12)",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            startEditingTrip(
                              trip
                            )
                          }
                          style={
                            styles.tripCardButton
                          }
                        >
                          <div
                            style={
                              styles.tripCardTop
                            }
                          >
                            <div>
                              <div
                                style={
                                  styles.tripTagRow
                                }
                              >
                                <span
                                  style={
                                    pageTheme.pill
                                  }
                                >
                                  {capitalize(
                                    trip.status
                                  )}
                                </span>
                                <span
                                  style={
                                    pageTheme.pill
                                  }
                                >
                                  {capitalize(
                                    trip.tripType
                                  )}
                                </span>
                              </div>

                              <h3
                                style={
                                  styles.tripCardTitle
                                }
                              >
                                {trip.title}
                              </h3>
                            </div>

                            <strong
                              style={
                                styles.tripPrice
                              }
                            >
                              $
                              {Number(
                                trip.price || 0
                              ).toFixed(0)}
                            </strong>
                          </div>

                          <p
                            style={
                              styles.tripRoute
                            }
                          >
                            {trip.from} →{" "}
                            {trip.to}
                          </p>

                          <div
                            style={
                              styles.tripMeta
                            }
                          >
                            <span>
                              {formatCardDate(
                                trip.date
                              )}
                            </span>
                            <span>
                              {getSeatsLeft(
                                trip
                              )}{" "}
                              seats left
                            </span>
                            <span>
                              {trip.places
                                ?.length || 0}{" "}
                              stops
                            </span>
                          </div>
                        </button>

                        <div
                          style={
                            styles.tripLinks
                          }
                        >
                          <Link
                            to={`/trips/${tripId}`}
                            style={
                              styles.tripDetailsLink
                            }
                          >
                            Open public page
                          </Link>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </section>
        </aside>
      </div>
    </PublicPageLayout>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  min,
  max,
  step,
}) {
  return (
    <label style={pageTheme.field}>
      <span>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        style={pageTheme.control}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}) {
  return (
    <label style={pageTheme.field}>
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        style={pageTheme.control}
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {capitalize(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}) {
  return (
    <div
      style={{
        ...styles.statCard,
        background: accent,
      }}
    >
      <div style={styles.statIcon}>
        {icon}
      </div>
      <strong style={styles.statValue}>
        {value}
      </strong>
      <span style={styles.statLabel}>
        {label}
      </span>
    </div>
  );
}

function PreviewRow({
  icon,
  label,
  value,
}) {
  return (
    <div style={styles.previewRow}>
      <span style={styles.previewIcon}>
        {icon}
      </span>
      <div>
        <small style={styles.previewRowLabel}>
          {label}
        </small>
        <div style={styles.previewRowValue}>
          {value}
        </div>
      </div>
    </div>
  );
}

const styles = {
  headerCard: {
    minWidth: "min(100%, 170px)",
    padding: "18px 20px",
    borderRadius: 18,
    background:
      "linear-gradient(160deg, rgba(255, 255, 255, 0.86), rgba(219, 234, 254, 0.8))",
    border:
      "1px solid rgba(147, 197, 253, 0.45)",
    boxShadow:
      "0 12px 30px rgba(96, 165, 250, 0.18)",
    display: "grid",
    gap: 4,
    textAlign: "center",
  },

  headerValue: {
    fontSize: 30,
    color: "#1e3a8a",
  },

  headerLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      createAutoFitMinmax(180),
    gap: 14,
    marginBottom: 20,
  },

  statCard: {
    padding: 18,
    borderRadius: 18,
    border:
      "1px solid rgba(255, 255, 255, 0.6)",
    boxShadow:
      "0 14px 28px rgba(96, 165, 250, 0.12)",
    display: "grid",
    gap: 6,
  },

  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background:
      "rgba(255, 255, 255, 0.76)",
    color: "#1d4ed8",
    boxShadow:
      "0 10px 24px rgba(96, 165, 250, 0.16)",
  },

  statValue: {
    fontSize: 28,
    color: "#0f172a",
  },

  statLabel: {
    color: "#475569",
    fontWeight: 800,
  },

  layout: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1.2fr) minmax(350px, 0.8fr)",
    gap: 20,
    alignItems: "start",
  },

  layoutCompact: {
    gridTemplateColumns: "1fr",
  },

  formColumn: {
    minWidth: 0,
  },

  sidebar: {
    minWidth: 0,
  },

  formTopBar: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 18,
  },

  sectionTitle: {
    margin: "0 0 6px",
    fontSize: 22,
    fontWeight: 900,
    color: "#1e3a8a",
  },

  sectionText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.6,
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      createAutoFitMinmax(210),
    gap: 14,
  },

  placeHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    gap: 12,
    alignItems: "flex-start",
    flexWrap: "wrap",
    marginBottom: 14,
  },

  inlineHint: {
    margin: 0,
    color: "#64748b",
    lineHeight: 1.6,
    fontSize: 13,
  },

  placesList: {
    display: "grid",
    gap: 12,
  },

  placeCard: {
    padding: 16,
    borderRadius: 16,
    background:
      "rgba(255, 255, 255, 0.82)",
    border:
      "1px solid rgba(191, 219, 254, 0.78)",
  },

  placeCardHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    gap: 12,
    alignItems: "center",
    marginBottom: 12,
    color: "#1e3a8a",
  },

  placeDelete: {
    border: "none",
    background: "transparent",
    color: "#dc2626",
    cursor: "pointer",
    fontWeight: 800,
  },

  placeGrid: {
    display: "grid",
    gridTemplateColumns:
      createAutoFitMinmax(190),
    gap: 12,
  },

  formActions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "flex-end",
    marginTop: 18,
  },

  previewCard: {
    position: "relative",
    overflow: "hidden",
    padding: 22,
    borderRadius: 22,
    background:
      "linear-gradient(145deg, rgba(96, 165, 250, 0.16), rgba(167, 139, 250, 0.18), rgba(255, 255, 255, 0.9))",
    border:
      "1px solid rgba(147, 197, 253, 0.45)",
    boxShadow:
      "0 18px 46px rgba(96, 165, 250, 0.16)",
  },

  previewBadge: {
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: 999,
    background:
      "rgba(255, 255, 255, 0.84)",
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  previewTitle: {
    margin: "16px 0 8px",
    fontSize: "clamp(22px, 5vw, 26px)",
    lineHeight: 1.1,
    color: "#1e3a8a",
  },

  previewRoute: {
    margin: 0,
    color: "#2563eb",
    fontWeight: 800,
  },

  previewMeta: {
    display: "grid",
    gap: 12,
    marginTop: 20,
  },

  previewRow: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    background:
      "rgba(255, 255, 255, 0.72)",
    border:
      "1px solid rgba(191, 219, 254, 0.65)",
  },

  previewIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    background:
      "rgba(191, 219, 254, 0.65)",
    color: "#1d4ed8",
    flexShrink: 0,
  },

  previewRowLabel: {
    display: "block",
    color: "#64748b",
    marginBottom: 4,
  },

  previewRowValue: {
    color: "#0f172a",
    fontWeight: 800,
  },

  previewFooter: {
    display: "flex",
    justifyContent:
      "space-between",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 18,
    paddingTop: 16,
    borderTop:
      "1px solid rgba(147, 197, 253, 0.35)",
    color: "#1e3a8a",
  },

  catalogTop: {
    display: "flex",
    justifyContent:
      "space-between",
    gap: 14,
    alignItems: "flex-start",
    flexWrap: "wrap",
    marginBottom: 12,
  },

  catalogFilters: {
    display: "grid",
    gridTemplateColumns:
      createAutoFitMinmax(180),
    gap: 12,
  },

  tripList: {
    display: "grid",
    gap: 14,
    marginTop: 8,
  },

  tripCard: {
    borderRadius: 18,
    background:
      "rgba(255, 255, 255, 0.72)",
    border:
      "1px solid rgba(147, 197, 253, 0.45)",
    overflow: "hidden",
  },

  tripCardButton: {
    width: "100%",
    padding: "clamp(14px, 3.4vw, 18px)",
    border: "none",
    background: "transparent",
    textAlign: "left",
    cursor: "pointer",
  },

  tripCardTop: {
    display: "flex",
    justifyContent:
      "space-between",
    gap: 12,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },

  tripTagRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 10,
  },

  tripCardTitle: {
    margin: 0,
    fontSize: "clamp(18px, 4.8vw, 20px)",
    color: "#1e3a8a",
    overflowWrap: "anywhere",
  },

  tripPrice: {
    fontSize: 18,
    color: "#0f172a",
  },

  tripRoute: {
    margin: "10px 0 12px",
    color: "#2563eb",
    fontWeight: 800,
    overflowWrap: "anywhere",
  },

  tripMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    color: "#475569",
    fontSize: 13,
    fontWeight: 700,
    lineHeight: 1.5,
  },

  tripLinks: {
    padding: "0 18px 16px",
  },

  tripDetailsLink: {
    color: "#1d4ed8",
    fontWeight: 800,
    textDecoration: "none",
  },
};
