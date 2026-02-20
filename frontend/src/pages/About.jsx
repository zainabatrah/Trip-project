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
            A platform that helps organizers manage trips and helps users discover, plan, and book.
          </p>
        </div>

        <Link to="/" style={styles.backBtn}>← Back</Link>
      </div>

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>What this platform does</h2>

        <div style={styles.grid}>
          {features.map((f) => (
            <div key={f.title} style={styles.featureCard}>
              <div style={styles.featureTitle}>{f.title}</div>
              <div style={styles.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>

        <div style={styles.hr} />

        <div style={styles.twoCols}>
          <div>
            <h3 style={styles.smallTitle}>Key highlights</h3>
            <ul style={styles.list}>
              {highlights.map((x) => (
                <li key={x} style={styles.listItem}>{x}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 style={styles.smallTitle}>How users use it</h3>
            <ol style={styles.list}>
              <li style={styles.listItem}>Create an account and register.</li>
              <li style={styles.listItem}>Wait for approval (ID verification).</li>
              <li style={styles.listItem}>Browse trips or plan a private trip.</li>
              <li style={styles.listItem}>Book trips and review after completion.</li>
            </ol>
          </div>
        </div>

        <div style={styles.hr} />

        <div style={styles.actions}>
          <Link to="/register" style={styles.btn}>Create account</Link>
          <Link to="/login" style={styles.btnOutline}>Login</Link>
        </div>
      </div>

      <div style={styles.footerNote}>
        <div style={styles.footerTitle}>Next improvements (optional)</div>
        <div style={styles.footerText}>
          Add real-time trip availability, payment integration, map view, and weather widgets.
        </div>
      </div>
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
    flexDirection: "column",
    alignItems: "center",
  },

  header: {
    width: "100%",
    maxWidth: 900,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },

  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 900,
    color: "#14204a",
  },

  subtitle: {
    margin: "6px 0 0",
    fontSize: 14,
    fontWeight: 650,
    color: "rgba(20, 32, 74, 0.75)",
    lineHeight: 1.6,
    maxWidth: 650,
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
    fontWeight: 800,
    boxShadow: "0 10px 22px rgba(0,0,0,0.12)",
    whiteSpace: "nowrap",
  },

  card: {
    width: "100%",
    maxWidth: 900,
    padding: 22,
    borderRadius: 22,
    background: "rgba(255, 255, 255, 0.22)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.35)",
    boxShadow: "0 20px 45px rgba(0,0,0,0.18)",
  },

  sectionTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 900,
    color: "#22306a",
    marginBottom: 12,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
  },

  featureCard: {
    padding: 14,
    borderRadius: 18,
    background: "rgba(255,255,255,0.35)",
    border: "1px solid rgba(255,255,255,0.45)",
  },

  featureTitle: {
    fontSize: 14,
    fontWeight: 900,
    color: "#14204a",
    marginBottom: 6,
  },

  featureDesc: {
    fontSize: 13,
    fontWeight: 650,
    color: "rgba(20, 32, 74, 0.8)",
    lineHeight: 1.55,
  },

  hr: {
    height: 1,
    background: "rgba(255,255,255,0.45)",
    margin: "16px 0",
  },

  twoCols: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 14,
  },

  smallTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 900,
    color: "#22306a",
    marginBottom: 10,
  },

  list: {
    margin: 0,
    paddingLeft: 18,
    color: "rgba(20, 32, 74, 0.85)",
    fontWeight: 650,
    fontSize: 13,
    lineHeight: 1.7,
  },

  listItem: {
    marginBottom: 6,
  },

  actions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  btn: {
    padding: "10px 14px",
    borderRadius: 14,
    background: "linear-gradient(135deg, #6ec6ff, #7c83fd)",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 900,
  },

  btnOutline: {
    padding: "10px 14px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.25)",
    border: "1px solid rgba(255,255,255,0.5)",
    color: "#14204a",
    textDecoration: "none",
    fontWeight: 900,
  },

  footerNote: {
    width: "100%",
    maxWidth: 900,
    marginTop: 14,
    padding: 16,
    borderRadius: 18,
    background: "rgba(255, 255, 255, 0.18)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: "1px solid rgba(255,255,255,0.30)",
    boxShadow: "0 14px 30px rgba(0,0,0,0.12)",
  },

  footerTitle: {
    fontSize: 13,
    fontWeight: 900,
    color: "#22306a",
    marginBottom: 6,
  },

  footerText: {
    fontSize: 13,
    fontWeight: 650,
    color: "rgba(20, 32, 74, 0.78)",
    lineHeight: 1.6,
  },

  // responsive fallback
  "@media(maxWidth: 720px)": {},
};