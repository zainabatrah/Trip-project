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
    setTrip((p) => ({ ...p, [name]: value }));

    // If user changes startDate and endDate becomes invalid, auto-fix it
    if (name === "startDate" && trip.endDate && value > trip.endDate) {
      setTrip((p) => ({ ...p, startDate: value, endDate: value }));
    }
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
    else if (dest.length < 2)
      e.destination = "Destination must be at least 2 characters.";

    if (!trip.startDate) e.startDate = "Start date is required.";
    if (!trip.endDate) e.endDate = "End date is required.";

    if (trip.startDate && trip.endDate && trip.endDate < trip.startDate) {
      e.endDate = "End date must be after (or same as) start date.";
    }

    if (trip.notes && trip.notes.length > 800) {
      e.notes = "Notes are too long (max 800 chars).";
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

      // ✅ Demo logic: local save (works now)
      // Later replace with backend call: POST /api/private-trips
      const payload = {
        ...trip,
        title: trip.title.trim(),
        destination: trip.destination.trim(),
        createdAt: new Date().toISOString(),
      };

      const key = "private_trips";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      localStorage.setItem(key, JSON.stringify([payload, ...existing]));

      setServerMsg("Saved successfully ✅");
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
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Create Private Trip</h1>
          <p style={styles.subtitle}>
            Plan trips for your own comparison (not public).
          </p>
        </div>

        <Link to="/" style={styles.backBtn}>
          ← Back
        </Link>
      </div>

      <form onSubmit={onSubmit} style={styles.card}>
        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Trip title</label>
            <input
              style={{ ...styles.input, ...(show("title") ? styles.inputErr : {}) }}
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

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={styles.label}>Notes</label>
            <textarea
              style={{
                ...styles.input,
                minHeight: 110,
                resize: "vertical",
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
                <span style={styles.hintText}>Optional. Max 800 characters.</span>
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
  );
}

const styles = {
  page: {
    width: "100vw",
    minHeight: "100vh",
    padding: "28px 18px",
    background:
      "linear-gradient(135deg, #b8e1ff 0%, #a7c7ff 45%, #c3b1ff 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  },

  header: {
    width: "100%",
    maxWidth: 820,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },

  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 800,
    color: "#14204a",
    letterSpacing: 0.2,
  },

  subtitle: {
    margin: "6px 0 0",
    color: "rgba(20, 32, 74, 0.75)",
    fontSize: 14,
  },

  backBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.25)",
    border: "1px solid rgba(255,255,255,0.35)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    color: "#14204a",
    textDecoration: "none",
    fontWeight: 700,
    boxShadow: "0 10px 22px rgba(0,0,0,0.12)",
    whiteSpace: "nowrap",
  },

  card: {
    width: "100%",
    maxWidth: 820,
    padding: 22,
    borderRadius: 22,
    background: "rgba(255, 255, 255, 0.22)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.35)",
    boxShadow: "0 20px 45px rgba(0,0,0,0.18)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 14,
  },

  label: {
    display: "block",
    marginBottom: 7,
    fontSize: 13,
    fontWeight: 700,
    color: "#22306a",
  },

  input: {
    width: "100%",
    padding: "12px 13px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.55)",
    background: "rgba(255,255,255,0.68)",
    color: "#0f172a",
    outline: "none",
    fontSize: 14,
  },

  inputErr: {
    border: "1px solid rgba(215, 38, 61, 0.65)",
    background: "rgba(255, 255, 255, 0.78)",
  },

  errText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: 700,
    color: "#d7263d",
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
    color: "rgba(20, 32, 74, 0.7)",
    fontWeight: 600,
  },

  counter: {
    fontSize: 12,
    color: "rgba(20, 32, 74, 0.8)",
    fontWeight: 800,
  },

  toast: {
    marginTop: 14,
    padding: "10px 12px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.55)",
    border: "1px solid rgba(255,255,255,0.6)",
    color: "#14204a",
    fontWeight: 800,
    textAlign: "center",
  },

  btn: {
    width: "100%",
    marginTop: 14,
    padding: "14px 16px",
    borderRadius: 16,
    border: "none",
    background: "linear-gradient(135deg, #6ec6ff, #7c83fd)",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 15,
  },

  btnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
};