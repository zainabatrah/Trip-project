import { Link } from "react-router-dom";

export default function Approve() {
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Approval Required</h1>
      <p style={styles.text}>
        Your account is pending approval. Please wait for the organizer/admin to verify your
        registration (including your uploaded ID).
      </p>

      <div style={styles.card}>
        <p style={{ margin: 0 }}>
          Status: <b>Pending</b>
        </p>
        <p style={{ margin: "8px 0 0" }}>
          If this takes too long, contact support or the trip organization.
        </p>
      </div>

      <div style={styles.row}>
        <Link to="/" style={styles.btn}>Back to Welcome</Link>
        <Link to="/about" style={styles.btnOutline}>About us</Link>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 24, maxWidth: 700, margin: "0 auto" },
  title: { fontSize: 34, marginBottom: 10 },
  text: { fontSize: 16, opacity: 0.9 },
  card: { marginTop: 14, padding: 14, border: "1px solid #2a2a2a", borderRadius: 12 },
  row: { display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" },
  btn: {
    padding: "10px 14px",
    borderRadius: 10,
    background: "#ffffff",
    color: "#111",
    textDecoration: "none",
    fontWeight: 600,
  },
  btnOutline: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #ffffff",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 600,
  },
};
