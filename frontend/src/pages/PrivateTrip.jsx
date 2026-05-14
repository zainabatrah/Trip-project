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
    background: "#0f1020",
    color: "#ffffff",
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
    color: "#f8fafc",
    letterSpacing: "-0.04em",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#a7b0d8",
    fontSize: 15,
    fontWeight: 500,
    lineHeight: 1.7,
    maxWidth: 650,
  },

  backBtn: {
    padding: "11px 16px",
    borderRadius: 14,
    background: "#182343",
    border: "1px solid #263764",
    color: "#dce6ff",
    textDecoration: "none",
    fontWeight: 800,
    boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
    whiteSpace: "nowrap",
  },

  card: {
    width: "100%",
    padding: 24,
    borderRadius: 22,
    background: "#171b33",
    border: "1px solid #293154",
    boxShadow: "0 25px 70px rgba(0,0,0,0.35)",
    boxSizing: "border-box",
  },

  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    background: "linear-gradient(135deg, #5b6cff, #31d4c7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    fontSize: 26,
    fontWeight: 900,
    marginBottom: 16,
    boxShadow: "0 14px 30px rgba(91,108,255,0.35)",
  },

  cardTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 900,
    color: "#f8fafc",
  },

  cardSubtitle: {
    margin: "7px 0 22px",
    color: "#a7b0d8",
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
    color: "#dce6ff",
  },

  input: {
    width: "100%",
    padding: "13px 14px",
    borderRadius: 14,
    border: "1px solid #31426d",
    background: "#111a32",
    color: "#f8fafc",
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
    border: "1px solid rgba(248, 113, 113, 0.7)",
    background: "#17172b",
  },

  errText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: 800,
    color: "#f87171",
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
    color: "#aeb8dd",
    fontWeight: 500,
  },

  counter: {
    fontSize: 12,
    color: "#31d4c7",
    fontWeight: 900,
  },

  summaryBox: {
    padding: 16,
    borderRadius: 18,
    background: "#141c35",
    border: "1px solid #263764",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  summaryLabel: {
    color: "#aeb8dd",
    fontSize: 13,
    fontWeight: 700,
  },

  summaryValue: {
    color: "#31d4c7",
    fontSize: 15,
    fontWeight: 900,
  },

  toast: {
    marginTop: 16,
    padding: "12px 14px",
    borderRadius: 14,
    background: "rgba(34, 197, 94, 0.14)",
    border: "1px solid rgba(34, 197, 94, 0.35)",
    color: "#22c55e",
    fontWeight: 900,
    textAlign: "center",
  },

  btn: {
    width: "100%",
    marginTop: 16,
    padding: "14px 16px",
    borderRadius: 16,
    border: "none",
    background: "linear-gradient(135deg, #5b6cff, #31d4c7)",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 15,
    boxShadow: "0 12px 28px rgba(91,108,255,0.35)",
  },

  btnDisabled: {
    opacity: 0.55,
    cursor: "not-allowed",
    boxShadow: "none",
  },
};