import { Link } from "react-router-dom";
import { useState } from "react";

export default function PrivateTrip() {
  const [trip, setTrip] = useState({
    title: "",
    destination: "",
    startDate: "",
    endDate: "",
    transportation: "Car",
    notes: "",
  });

  function onChange(e) {
    const { name, value } = e.target;
    setTrip((p) => ({ ...p, [name]: value }));
  }

  function onSubmit(e) {
    e.preventDefault();
    // Later: send to backend (save private trip for the user)
    alert("Private trip saved (demo). Next step: connect to backend.");
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Create Private Trip</h1>
      <p style={styles.text}>
        Plan your own trip for personal planning and comparison (not public).
      </p>

      <form onSubmit={onSubmit} style={styles.card}>
        <label style={styles.label}>Trip title</label>
        <input
          style={styles.input}
          name="title"
          value={trip.title}
          onChange={onChange}
          placeholder="My Summer Trip"
          required
        />

        <label style={styles.label}>Destination</label>
        <input
          style={styles.input}
          name="destination"
          value={trip.destination}
          onChange={onChange}
          placeholder="Beirut, Istanbul, Paris..."
          required
        />

        <div style={styles.row}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Start date</label>
            <input
              style={styles.input}
              type="date"
              name="startDate"
              value={trip.startDate}
              onChange={onChange}
              required
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={styles.label}>End date</label>
            <input
              style={styles.input}
              type="date"
              name="endDate"
              value={trip.endDate}
              onChange={onChange}
              required
            />
          </div>
        </div>

        <label style={styles.label}>Transportation</label>
        <select
          style={styles.input}
          name="transportation"
          value={trip.transportation}
          onChange={onChange}
        >
          <option>Car</option>
          <option>Bus</option>
          <option>Plane</option>
          <option>Train</option>
          <option>Boat</option>
        </select>

        <label style={styles.label}>Notes</label>
        <textarea
          style={{ ...styles.input, minHeight: 90 }}
          name="notes"
          value={trip.notes}
          onChange={onChange}
          placeholder="Restaurants, stops, budget, ideas..."
        />

        <button style={styles.btn} type="submit">Save Private Trip</button>

        <div style={{ marginTop: 12 }}>
          <Link to="/" style={styles.link}>Back to Welcome</Link>
        </div>
      </form>
    </div>
  );
}

const styles = {
  page: { padding: 24, maxWidth: 650, margin: "0 auto" },
  title: { fontSize: 30, marginBottom: 8 },
  text: { fontSize: 16, opacity: 0.9, marginBottom: 14 },
  card: { padding: 16, border: "1px solid #2a2a2a", borderRadius: 12 },
  label: { display: "block", marginTop: 10, marginBottom: 6 },
  row: { display: "flex", gap: 12, flexWrap: "wrap" },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    border: "1px solid #333",
    background: "#111",
    color: "#fff",
  },
  btn: {
    width: "100%",
    marginTop: 14,
    padding: "10px 14px",
    borderRadius: 10,
    border: "none",
    background: "#ffffff",
    color: "#111",
    fontWeight: 700,
    cursor: "pointer",
  },
  link: { color: "#cfd8ff", textDecoration: "underline" },
};
