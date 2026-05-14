import { Link } from "react-router-dom";
import { useMemo, useState } from "react";

export default function PrivateTrip() {
  const [trip, setTrip] = useState({
    title: "",
    destination: "",
    startDate: "",
    endDate: "",
    transportation: "Car",
    notes: "",
  });

  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverMsg, setServerMsg] = useState("");

  function onChange(e) {
    const { name, value } = e.target;

    setTrip((p) => {
      const updated = { ...p, [name]: value };

      if (name === "startDate" && updated.endDate && value > updated.endDate) {
        updated.endDate = value;
      }

      return updated;
    });
  }

  function onBlur(e) {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
  }

  const errors = useMemo(() => {
    const e = {};
    const title = trip.title.trim();
    const dest = trip.destination.trim();

    if (!title) e.title = "Title is required.";
    else if (title.length < 3) e.title = "Title must be at least 3 characters.";

    if (!dest) e.destination = "Destination is required.";
    else if (dest.length < 2) {
      e.destination = "Destination must be at least 2 characters.";
    }

    if (!trip.startDate) e.startDate = "Start date is required.";
    if (!trip.endDate) e.endDate = "End date is required.";

    if (trip.startDate && trip.endDate && trip.endDate < trip.startDate) {
      e.endDate = "End date must be after or same as start date.";
    }

    if (trip.notes && trip.notes.length > 800) {
      e.notes = "Notes are too long. Max 800 characters.";
    }

    return e;
  }, [trip]);

  const isValid = Object.keys(errors).length === 0;

  async function onSubmit(e) {
    e.preventDefault();
    setServerMsg("");

    setTouched({
      title: true,
      destination: true,
      startDate: true,
      endDate: true,
      transportation: true,
      notes: true,
    });

    if (!isValid) return;

    try {
      setSaving(true);

      const payload = {
        ...trip,
        title: trip.title.trim(),
        destination: trip.destination.trim(),
        createdAt: new Date().toISOString(),
      };

      const key = "private_trips";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      localStorage.setItem(key, JSON.stringify([payload, ...existing]));

      setServerMsg("Saved successfully.");
      setTrip({
        title: "",
        destination: "",
        startDate: "",
        endDate: "",
        transportation: "Car",
        notes: "",
      });
      setTouched({});
    } catch {
      setServerMsg("Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const show = (field) => touched[field] && errors[field];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Create Private Trip</h1>
            <p style={styles.subtitle}>
              Plan trips privately, compare options, and save your travel ideas.
            </p>
          </div>

          <Link to="/" style={styles.backBtn}>
            ← Back
          </Link>
        </div>

        <form onSubmit={onSubmit} style={styles.card}>
          <div style={styles.iconBox}>✈</div>

          <h2 style={styles.cardTitle}>Trip Details</h2>
          <p style={styles.cardSubtitle}>
            This trip is saved privately and is not visible to other users.
          </p>

          <div style={styles.grid}>
            <div>
              <label style={styles.label}>Trip title</label>
              <input
                style={{
                  ...styles.input,
                  ...(show("title") ? styles.inputErr : {}),
                }}
                name="title"
                value={trip.title}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="My Summer Trip"
                required
              />
              {show("title") && <div style={styles.errText}>{errors.title}</div>}
            </div>

            <div>
              <label style={styles.label}>Destination</label>
              <input
                style={{
                  ...styles.input,
                  ...(show("destination") ? styles.inputErr : {}),
                }}
                name="destination"
                value={trip.destination}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="Beirut, Istanbul, Paris..."
                required
              />
              {show("destination") && (
                <div style={styles.errText}>{errors.destination}</div>
              )}
            </div>

            <div>
              <label style={styles.label}>Start date</label>
              <input
                style={{
                  ...styles.input,
                  ...(show("startDate") ? styles.inputErr : {}),
                }}
                type="date"
                name="startDate"
                value={trip.startDate}
                onChange={onChange}
                onBlur={onBlur}
                required
              />
              {show("startDate") && (
                <div style={styles.errText}>{errors.startDate}</div>
              )}
            </div>

            <div>
              <label style={styles.label}>End date</label>
              <input
                style={{
                  ...styles.input,
                  ...(show("endDate") ? styles.inputErr : {}),
                }}
                type="date"
                name="endDate"
                value={trip.endDate}
                onChange={onChange}
                onBlur={onBlur}
                min={trip.startDate || undefined}
                required
              />
              {show("endDate") && (
                <div style={styles.errText}>{errors.endDate}</div>
              )}
            </div>

            <div>
              <label style={styles.label}>Transportation</label>
              <select
                style={styles.input}
                name="transportation"
                value={trip.transportation}
                onChange={onChange}
                onBlur={onBlur}
              >
                <option>Car</option>
                <option>Bus</option>
                <option>Plane</option>
                <option>Train</option>
                <option>Boat</option>
              </select>
            </div>

            <div style={styles.summaryBox}>
              <span style={styles.summaryLabel}>Selected vehicle</span>
              <strong style={styles.summaryValue}>{trip.transportation}</strong>
            </div>

            <div style={styles.fullWidth}>
              <label style={styles.label}>Notes</label>
              <textarea
                style={{
                  ...styles.input,
                  ...styles.textarea,
                  ...(show("notes") ? styles.inputErr : {}),
                }}
                name="notes"
                value={trip.notes}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="Restaurants, stops, budget, ideas..."
                maxLength={800}
              />

              <div style={styles.hintRow}>
                {show("notes") ? (
                  <span style={styles.errText}>{errors.notes}</span>
                ) : (
                  <span style={styles.hintText}>
                    Optional. Max 800 characters.
                  </span>
                )}

                <span style={styles.counter}>{trip.notes.length}/800</span>
              </div>
            </div>
          </div>

          {serverMsg && <div style={styles.toast}>{serverMsg}</div>}

          <button
            style={{
              ...styles.btn,
              ...(saving || !isValid ? styles.btnDisabled : {}),
            }}
            type="submit"
            disabled={saving || !isValid}
          >
            {saving ? "Saving..." : "Save Private Trip"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    width: "100vw",
    minHeight: "100vh",
    padding: "34px 26px",
    background: "linear-gradient(135deg, #dbeafe 0%, #c7d2fe 55%, #e9d5ff 100%)",
    color: "#1e293b",
    fontFamily: "Inter, Arial, sans-serif",
    boxSizing: "border-box",
  },

  container: {
    width: "100%",
    maxWidth: 1000,
    margin: "0 auto",
  },

  header: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    marginBottom: 22,
  },

  title: {
    margin: 0,
    fontSize: 34,
    fontWeight: 900,
    color: "#1e3a8a",
    letterSpacing: "-0.04em",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#475569",
    fontSize: 15,
    fontWeight: 500,
    lineHeight: 1.7,
    maxWidth: 650,
  },

  backBtn: {
    padding: "11px 16px",
    borderRadius: 14,
    background: "linear-gradient(135deg, #bfdbfe, #c4b5fd)",
    border: "1px solid rgba(147, 197, 253, 0.55)",
    color: "#0f172a",
    textDecoration: "none",
    fontWeight: 900,
    boxShadow: "0 10px 25px rgba(96, 165, 250, 0.22)",
    whiteSpace: "nowrap",
  },

  card: {
    width: "100%",
    padding: 24,
    borderRadius: 22,
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid rgba(147, 197, 253, 0.45)",
    boxShadow: "0 25px 70px rgba(59, 130, 246, 0.22)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    boxSizing: "border-box",
  },

  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    fontSize: 26,
    fontWeight: 900,
    marginBottom: 16,
    boxShadow: "0 14px 30px rgba(96, 165, 250, 0.35)",
  },

  cardTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 900,
    color: "#1e3a8a",
  },

  cardSubtitle: {
    margin: "7px 0 22px",
    color: "#475569",
    fontSize: 14,
    lineHeight: 1.6,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 16,
  },

  fullWidth: {
    gridColumn: "1 / -1",
  },

  label: {
    display: "block",
    marginBottom: 7,
    fontSize: 13,
    fontWeight: 800,
    color: "#334155",
  },

  input: {
    width: "100%",
    padding: "13px 14px",
    borderRadius: 14,
    border: "1px solid #bfdbfe",
    background: "rgba(255,255,255,0.9)",
    color: "#0f172a",
    outline: "none",
    fontSize: 14,
    fontWeight: 500,
    boxSizing: "border-box",
  },

  textarea: {
    minHeight: 120,
    resize: "vertical",
    fontFamily: "Inter, Arial, sans-serif",
  },

  inputErr: {
    border: "1px solid rgba(220, 38, 38, 0.65)",
    background: "rgba(254, 242, 242, 0.95)",
  },

  errText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: 800,
    color: "#dc2626",
  },

  hintRow: {
    marginTop: 8,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },

  hintText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: 500,
  },

  counter: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: 900,
  },

  summaryBox: {
    padding: 16,
    borderRadius: 18,
    background: "rgba(255,255,255,0.72)",
    border: "1px solid #bfdbfe",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  summaryLabel: {
    color: "#475569",
    fontSize: 13,
    fontWeight: 700,
  },

  summaryValue: {
    color: "#2563eb",
    fontSize: 15,
    fontWeight: 900,
  },

  toast: {
    marginTop: 16,
    padding: "12px 14px",
    borderRadius: 14,
    background: "rgba(34, 197, 94, 0.14)",
    border: "1px solid rgba(34, 197, 94, 0.35)",
    color: "#15803d",
    fontWeight: 900,
    textAlign: "center",
  },

  btn: {
    width: "100%",
    marginTop: 16,
    padding: "14px 16px",
    borderRadius: 16,
    border: "none",
    background: "linear-gradient(135deg, #93c5fd, #a78bfa)",
    color: "#0f172a",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 15,
    boxShadow: "0 12px 28px rgba(96, 165, 250, 0.35)",
  },

  btnDisabled: {
    opacity: 0.55,
    cursor: "not-allowed",
    boxShadow: "none",
  },
};