
import { Link } from "react-router-dom";

export default function About() {
  const features = [
    {
      title: "Trip Management",
      desc: "Organizations create, update, and control trips from one dashboard.",
    },
    {
      title: "Browsing & Planning",
      desc: "Users explore trips, compare schedules, and plan privately before booking.",
    },
    {
      title: "Booking & Reviews",
      desc: "Book trips securely and submit reviews after the trip ends.",
    },
  ];

  const highlights = [
    "Clear schedules & stops",
    "Private trip planning",
    "Ratings & reviews",
    "Organizers dashboard",
    "Future: maps & weather",
  ];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>About Trip Management</h1>
          <p style={styles.subtitle}>
            A platform that helps organizers manage trips and helps users
            discover, plan, and book.
          </p>
        </div>

        <Link to="/" style={styles.backBtn}>
          ← Back
        </Link>
      </div>

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>What this platform does</h2>

        <div style={styles.grid}>
          {features.map((f) => (
            <div key={f.title} style={styles.featureCard}>
              <div style={styles.iconCircle}>✦</div>
              <div style={styles.featureTitle}>{f.title}</div>
              <div style={styles.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>

        <div style={styles.hr} />

        <div style={styles.twoCols}>
          <div style={styles.infoBox}>
            <h3 style={styles.smallTitle}>Key highlights</h3>
            <ul style={styles.list}>
              {highlights.map((x) => (
                <li key={x} style={styles.listItem}>
                  {x}
                </li>
              ))}
            </ul>
          </div>

          <div style={styles.infoBox}>
            <h3 style={styles.smallTitle}>How users use it</h3>
            <ol style={styles.list}>
              <li style={styles.listItem}>Create an account and register.</li>
              <li style={styles.listItem}>Wait for approval ID verification.</li>
              <li style={styles.listItem}>Browse trips or plan a private trip.</li>
              <li style={styles.listItem}>Book trips and review after completion.</li>
            </ol>
          </div>
        </div>

        <div style={styles.hr} />

        <div style={styles.actions}>
          <Link to="/register" style={styles.btn}>
            Create account
          </Link>
          <Link to="/login" style={styles.btnOutline}>
            Login
          </Link>
        </div>
      </div>

      <div style={styles.footerNote}>
        <div style={styles.footerTitle}>Next improvements</div>
        <div style={styles.footerText}>
          Add real-time trip availability, payment integration, map view, and
          weather widgets.
        </div>
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
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "Inter, Arial, sans-serif",
    boxSizing: "border-box",
  },

  header: {
    width: "100%",
    maxWidth: 1100,
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
    fontSize: 15,
    fontWeight: 500,
    color: "#a7b0d8",
    lineHeight: 1.7,
    maxWidth: 680,
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
    maxWidth: 1100,
    padding: 24,
    borderRadius: 22,
    background: "#171b33",
    border: "1px solid #293154",
    boxShadow: "0 25px 70px rgba(0,0,0,0.35)",
    boxSizing: "border-box",
  },

  sectionTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 900,
    color: "#f8fafc",
    marginBottom: 16,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: 16,
  },

  featureCard: {
    padding: 18,
    borderRadius: 18,
    background: "#16213f",
    border: "1px solid #28365f",
    boxShadow: "0 12px 30px rgba(0,0,0,0.22)",
  },

  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 14,
    background: "linear-gradient(135deg, #5b6cff, #31d4c7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    fontSize: 18,
    fontWeight: 900,
    marginBottom: 12,
  },

  featureTitle: {
    fontSize: 16,
    fontWeight: 900,
    color: "#ffffff",
    marginBottom: 8,
  },

  featureDesc: {
    fontSize: 14,
    fontWeight: 500,
    color: "#aeb8dd",
    lineHeight: 1.65,
  },

  hr: {
    height: 1,
    background: "#293154",
    margin: "22px 0",
  },

  twoCols: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 18,
  },

  infoBox: {
    padding: 18,
    borderRadius: 18,
    background: "#141c35",
    border: "1px solid #263764",
  },

  smallTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 900,
    color: "#f8fafc",
    marginBottom: 12,
  },

  list: {
    margin: 0,
    paddingLeft: 20,
    color: "#aeb8dd",
    fontWeight: 500,
    fontSize: 14,
    lineHeight: 1.8,
  },

  listItem: {
    marginBottom: 7,
  },

  actions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  btn: {
    padding: "11px 16px",
    borderRadius: 14,
    background: "linear-gradient(135deg, #5b6cff, #31d4c7)",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 900,
    boxShadow: "0 12px 28px rgba(91,108,255,0.35)",
  },

  btnOutline: {
    padding: "11px 16px",
    borderRadius: 14,
    background: "#182343",
    border: "1px solid #31426d",
    color: "#dce6ff",
    textDecoration: "none",
    fontWeight: 900,
  },

  footerNote: {
    width: "100%",
    maxWidth: 1100,
    marginTop: 16,
    padding: 18,
    borderRadius: 18,
    background: "#171b33",
    border: "1px solid #293154",
    boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
    boxSizing: "border-box",
  },

  footerTitle: {
    fontSize: 14,
    fontWeight: 900,
    color: "#f8fafc",
    marginBottom: 7,
  },

  footerText: {
    fontSize: 14,
    fontWeight: 500,
    color: "#aeb8dd",
    lineHeight: 1.7,
  },
};