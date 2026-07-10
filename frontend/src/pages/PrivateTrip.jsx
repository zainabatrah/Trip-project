import { useMemo, useState } from "react";

import TopNavbar from "../components/TopNavbar";
import welcomeStyles from "../Styles/welcome.module.css";
import { createPrivateTripRequest } from "../api/privateTripRequests.js";

const EMPTY_TRIP = {
  title: "",
  destination: "",
  startDate: "",
  endDate: "",
  transportation: "Car",
  travelers: "",
  budget: "",
  notes: "",
};

export default function PrivateTrip() {
  const [trip, setTrip] = useState(EMPTY_TRIP);
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverMsg, setServerMsg] = useState("");
  const [serverError, setServerError] = useState("");

  function onChange(event) {
    const { name, value } = event.target;

    setTrip((previousTrip) => {
      const updatedTrip = {
        ...previousTrip,
        [name]: value,
      };

      if (
        name === "startDate" &&
        updatedTrip.endDate &&
        value > updatedTrip.endDate
      ) {
        updatedTrip.endDate = value;
      }

      return updatedTrip;
    });

    setServerMsg("");
    setServerError("");
  }

  function onBlur(event) {
    const { name } = event.target;

    setTouched((previousTouched) => ({
      ...previousTouched,
      [name]: true,
    }));
  }

  const errors = useMemo(() => {
    const newErrors = {};

    const cleanTitle = trip.title.trim();
    const cleanDestination = trip.destination.trim();
    const travelers = Number(trip.travelers);
    const budget = Number(trip.budget);

    if (!cleanTitle) {
      newErrors.title = "Trip title is required.";
    } else if (cleanTitle.length < 3) {
      newErrors.title =
        "Trip title must contain at least 3 characters.";
    }

    if (!cleanDestination) {
      newErrors.destination = "Destination is required.";
    } else if (cleanDestination.length < 2) {
      newErrors.destination =
        "Destination must contain at least 2 characters.";
    }

    if (!trip.startDate) {
      newErrors.startDate = "Start date is required.";
    }

    if (!trip.endDate) {
      newErrors.endDate = "End date is required.";
    }

    if (
      trip.startDate &&
      trip.endDate &&
      trip.endDate < trip.startDate
    ) {
      newErrors.endDate =
        "End date cannot be before the start date.";
    }

    const allowedTransportation = [
      "Car",
      "Van",
      "Minibus",
      "Bus",
    ];

    if (!allowedTransportation.includes(trip.transportation)) {
      newErrors.transportation =
        "Select Car, Van, Minibus, or Bus.";
    }

    if (trip.travelers === "") {
      newErrors.travelers = "Number of travelers is required.";
    } else if (!Number.isInteger(travelers) || travelers < 1) {
      newErrors.travelers =
        "Travelers must be a whole number greater than 0.";
    }

    if (trip.budget === "") {
      newErrors.budget = "Budget is required.";
    } else if (!Number.isFinite(budget) || budget < 0) {
      newErrors.budget =
        "Budget must be a valid non-negative number.";
    }

    if (trip.notes.length > 800) {
      newErrors.notes =
        "Notes cannot contain more than 800 characters.";
    }

    return newErrors;
  }, [trip]);

  const isValid = Object.keys(errors).length === 0;

  function showError(field) {
    return touched[field] ? errors[field] : "";
  }

  async function onSubmit(event) {
    event.preventDefault();

    setServerMsg("");
    setServerError("");

    setTouched({
      title: true,
      destination: true,
      startDate: true,
      endDate: true,
      transportation: true,
      travelers: true,
      budget: true,
      notes: true,
    });

    if (!isValid || saving) {
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: trip.title.trim(),
        destination: trip.destination.trim(),
        startDate: trip.startDate,
        endDate: trip.endDate,
        transportation: trip.transportation,
        travelers: Number(trip.travelers),
        budget: Number(trip.budget),
        notes: trip.notes.trim(),
        clientName:
          getStoredUser()?.name ||
          localStorage.getItem("tripUserName") ||
          localStorage.getItem("userName") ||
          "Client",
        email:
          getStoredUser()?.email ||
          localStorage.getItem("tripUserEmail") ||
          localStorage.getItem("userEmail") ||
          "",
      };

      const response = await createPrivateTripRequest(payload);

      setServerMsg(
        response?.message ||
          "Private trip request sent successfully."
      );

      setTrip(EMPTY_TRIP);
      setTouched({});
    } catch (error) {
      console.error("Private trip submission failed:", error);

      setServerError(
        error?.message ||
          "Could not send the private trip request."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={welcomeStyles.body}
      style={styles.page}
    >
      <TopNavbar />

      <main style={styles.main}>
        <div style={styles.container}>
          <h1 style={styles.title}>Create Private Trip</h1>

          <p style={styles.subtitle}>
            Submit a private trip request. The organizer will
            review it and send you a result message.
          </p>

          <form
            onSubmit={onSubmit}
            noValidate
            style={styles.card}
          >
            <div style={styles.grid}>
              <Field
                label="Trip title"
                name="title"
                value={trip.title}
                onChange={onChange}
                onBlur={onBlur}
                error={showError("title")}
                placeholder="My Summer Trip"
                disabled={saving}
              />

              <Field
                label="Destination"
                name="destination"
                value={trip.destination}
                onChange={onChange}
                onBlur={onBlur}
                error={showError("destination")}
                placeholder="Beirut, Baalbek, Byblos..."
                disabled={saving}
              />

              <Field
                label="Start date"
                type="date"
                name="startDate"
                value={trip.startDate}
                onChange={onChange}
                onBlur={onBlur}
                error={showError("startDate")}
                disabled={saving}
              />

              <Field
                label="End date"
                type="date"
                name="endDate"
                value={trip.endDate}
                onChange={onChange}
                onBlur={onBlur}
                error={showError("endDate")}
                min={trip.startDate || undefined}
                disabled={saving}
              />

              <div>
                <label
                  htmlFor="transportation"
                  style={styles.label}
                >
                  Transportation
                </label>

                <select
                  id="transportation"
                  name="transportation"
                  value={trip.transportation}
                  onChange={onChange}
                  onBlur={onBlur}
                  disabled={saving}
                  style={{
                    ...styles.input,
                    ...(showError("transportation")
                      ? styles.inputErr
                      : {}),
                  }}
                >
                  <option value="Car">Car</option>
                  <option value="Van">Van</option>
                  <option value="Minibus">Minibus</option>
                  <option value="Bus">Bus</option>
                </select>

                {showError("transportation") && (
                  <div style={styles.errText}>
                    {showError("transportation")}
                  </div>
                )}
              </div>

              <Field
                label="Travelers"
                type="number"
                name="travelers"
                value={trip.travelers}
                onChange={onChange}
                onBlur={onBlur}
                error={showError("travelers")}
                placeholder="Example: 3"
                min="1"
                step="1"
                disabled={saving}
              />

              <Field
                label="Budget"
                type="number"
                name="budget"
                value={trip.budget}
                onChange={onChange}
                onBlur={onBlur}
                error={showError("budget")}
                placeholder="Example: 500"
                min="0"
                step="0.01"
                disabled={saving}
              />

              <div style={styles.fullWidth}>
                <label
                  htmlFor="notes"
                  style={styles.label}
                >
                  Notes
                </label>

                <textarea
                  id="notes"
                  name="notes"
                  value={trip.notes}
                  onChange={onChange}
                  onBlur={onBlur}
                  disabled={saving}
                  placeholder="Restaurants, stops, budget, ideas..."
                  maxLength={800}
                  style={{
                    ...styles.input,
                    ...styles.textarea,
                    ...(showError("notes")
                      ? styles.inputErr
                      : {}),
                  }}
                />

                <div style={styles.hintRow}>
                  <span
                    style={
                      showError("notes")
                        ? styles.errText
                        : styles.hintText
                    }
                  >
                    {showError("notes") ||
                      "Optional. Maximum 800 characters."}
                  </span>

                  <span style={styles.counter}>
                    {trip.notes.length}/800
                  </span>
                </div>
              </div>
            </div>

            {serverMsg && (
              <div style={styles.successBox}>
                {serverMsg}
              </div>
            )}

            {serverError && (
              <div style={styles.errorBox}>
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={saving || !isValid}
              style={{
                ...styles.btn,
                ...(saving || !isValid
                  ? styles.btnDisabled
                  : {}),
              }}
            >
              {saving
                ? "Sending..."
                : "Send Private Trip Request"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  type = "text",
  placeholder = "",
  min,
  step,
  disabled = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        style={styles.label}
      >
        {label}
      </label>

      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        min={min}
        step={step}
        disabled={disabled}
        style={{
          ...styles.input,
          ...(error ? styles.inputErr : {}),
        }}
      />

      {error && (
        <div style={styles.errText}>{error}</div>
      )}
    </div>
  );
}

function getStoredUser() {
  const possibleKeys = [
    "currentUser",
    "tripUser",
    "user",
  ];

  for (const key of possibleKeys) {
    const value = localStorage.getItem(key);

    if (!value || value === "null") {
      continue;
    }

    try {
      const parsedUser = JSON.parse(value);

      if (
        parsedUser &&
        typeof parsedUser === "object"
      ) {
        return parsedUser;
      }
    } catch {
      // Ignore invalid stored JSON.
    }
  }

  return null;
}

const styles = {
  page: {
    width: "100%",
    minHeight: "100vh",
    color: "#1e293b",
    fontFamily: "Inter, Arial, sans-serif",
  },

  main: {
    width: "100%",
    padding: "34px 26px",
    boxSizing: "border-box",
  },

  container: {
    width: "100%",
    maxWidth: 1000,
    margin: "0 auto",
  },

  title: {
    margin: 0,
    fontSize: 34,
    fontWeight: 900,
    color: "#1e3a8a",
  },

  subtitle: {
    margin: "8px 0 22px",
    color: "#475569",
    fontSize: 15,
    lineHeight: 1.7,
  },

  card: {
    width: "100%",
    padding: 24,
    borderRadius: 22,
    background: "rgba(255, 255, 255, 0.78)",
    border:
      "1px solid rgba(147, 197, 253, 0.45)",
    boxShadow:
      "0 25px 70px rgba(59, 130, 246, 0.18)",
    boxSizing: "border-box",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 16,
  },

  fullWidth: {
    gridColumn: "1 / -1",
  },

  label: {
    display: "block",
    marginBottom: 7,
    fontSize: 13,
    fontWeight: 900,
    color: "#1e3a8a",
  },

  input: {
    width: "100%",
    minHeight: 46,
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid #bfdbfe",
    outline: "none",
    fontSize: 14,
    fontWeight: 600,
    boxSizing: "border-box",
    background: "#ffffff",
    color: "#0f172a",
  },

  textarea: {
    minHeight: 120,
    resize: "vertical",
  },

  inputErr: {
    borderColor: "#ef4444",
  },

  errText: {
    marginTop: 6,
    color: "#dc2626",
    fontSize: 12,
    fontWeight: 800,
  },

  hintRow: {
    marginTop: 6,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  hintText: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: 700,
  },

  counter: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: 800,
  },

  successBox: {
    marginTop: 16,
    padding: 13,
    borderRadius: 14,
    background: "rgba(34, 197, 94, 0.15)",
    color: "#15803d",
    fontWeight: 900,
  },

  errorBox: {
    marginTop: 16,
    padding: 13,
    borderRadius: 14,
    background: "rgba(239, 68, 68, 0.15)",
    color: "#dc2626",
    fontWeight: 900,
  },

  btn: {
    marginTop: 20,
    width: "100%",
    padding: "14px 18px",
    border: "none",
    borderRadius: 16,
    background:
      "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#ffffff",
    fontSize: 15,
    fontWeight: 900,
    cursor: "pointer",
  },

  btnDisabled: {
    opacity: 0.55,
    cursor: "not-allowed",
  },
};