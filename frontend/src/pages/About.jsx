import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

export default function About() {
  const isLoggedIn = checkUserLoggedIn();

  const features = [
    {
      title: "Trip Management",
      desc: "Organizations can create, update, and manage trips from one dashboard.",
    },
    {
      title: "Browsing & Planning",
      desc: "Users can explore trips, compare routes, and plan their journey before booking.",
    },
    {
      title: "Private Trips",
      desc: "Users can request a private custom trip with their own destination, date, and details.",
    },
    {
      title: "Booking & Reviews",
      desc: "Users can book trips securely and submit reviews after the trip is completed.",
    },
  ];

  const highlights = [
    "Clear schedules and trip details",
    "Private trip requests",
    "Trip browsing and filtering",
    "User account system",
    "Future: maps, payments, and weather",
  ];

  const aboutContent = (
    <div style={styles.contentWrapper}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>About TripManager</h1>
          <p style={styles.subtitle}>
            TripManager helps users discover trips, request private trips, and
            manage their travel experience in a simple way.
          </p>
        </div>

        {!isLoggedIn && (
          <Link to="/trips" style={styles.backBtn}>
            ← Back to Trips
          </Link>
        )}
      </div>

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>What this platform does</h2>

        <div style={styles.grid}>
          {features.map((feature) => (
            <div key={feature.title} style={styles.featureCard}>
              <div style={styles.iconCircle}>✦</div>
              <div style={styles.featureTitle}>{feature.title}</div>
              <div style={styles.featureDesc}>{feature.desc}</div>
            </div>
          ))}
        </div>

        <div style={styles.hr} />

        <div style={styles.twoCols}>
          <div style={styles.infoBox}>
            <h3 style={styles.smallTitle}>Key highlights</h3>

            <ul style={styles.list}>
              {highlights.map((item) => (
                <li key={item} style={styles.listItem}>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div style={styles.infoBox}>
            <h3 style={styles.smallTitle}>How users use it</h3>

            <ol style={styles.list}>
              <li style={styles.listItem}>Create an account or login.</li>
              <li style={styles.listItem}>Browse available trips.</li>
              <li style={styles.listItem}>Request a private trip if needed.</li>
              <li style={styles.listItem}>Book trips and manage bookings.</li>
            </ol>
          </div>
        </div>

        <div style={styles.hr} />

        <div style={styles.actions}>
          <Link to="/trips" style={styles.btn}>
            Browse Trips
          </Link>

          <Link to="/private-trip" style={styles.btn}>
            Private Trip
          </Link>

          {!isLoggedIn && (
            <>
              <Link to="/register" style={styles.btnOutline}>
                Create Account
              </Link>

              <Link to="/login" style={styles.btnOutline}>
                Login
              </Link>
            </>
          )}
        </div>
      </div>

      <div style={styles.footerNote}>
        <div style={styles.footerTitle}>Next improvements</div>

        <div style={styles.footerText}>
          Add real-time trip availability, online payments, map view, weather
          widgets, and organizer trip dashboards.
        </div>
      </div>
    </div>
  );

  if (isLoggedIn) {
    return <DashboardLayout>{aboutContent}</DashboardLayout>;
  }

  return <div style={styles.publicPage}>{aboutContent}</div>;
}

function checkUserLoggedIn() {
  const authKeys = [
    "isRegistered",
    "token",
    "authToken",
    "accessToken",
    "user",
    "tripUser",
    "currentUser",
    "tripUserName",
    "tripUserEmail",
  ];

  return authKeys.some((key) => {
    const value = localStorage.getItem(key);
    return value !== null && value !== "" && value !== "null";
  });
}

const styles = {
  publicPage: {
    width: "100%",
    minHeight: "100vh",
    padding: "34px 26px",
    background:
      "linear-gradient(135deg, #dbeafe 0%, #c7d2fe 55%, #e9d5ff 100%)",
    color: "#1e293b",
    display: "flex",
    justifyContent: "center",
    boxSizing: "border-box",
    fontFamily: "Inter, Arial, sans-serif",
    overflowX: "hidden",
  },

  contentWrapper: {
    width: "100%",
    maxWidth: 1180,
    margin: "0 auto",
    color: "#1e293b",
    boxSizing: "border-box",
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
    fontSize: 15,
    fontWeight: 500,
    color: "#475569",
    lineHeight: 1.7,
    maxWidth: 680,
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

  sectionTitle: {
    margin: "0 0 16px",
    fontSize: 20,
    fontWeight: 900,
    color: "#1e3a8a",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: 16,
  },

  featureCard: {
    padding: 18,
    borderRadius: 18,
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid #bfdbfe",
    boxShadow: "0 12px 30px rgba(96, 165, 250, 0.18)",
  },

  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 14,
    background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    fontSize: 18,
    fontWeight: 900,
    marginBottom: 12,
    boxShadow: "0 10px 22px rgba(96, 165, 250, 0.28)",
  },

  featureTitle: {
    fontSize: 16,
    fontWeight: 900,
    color: "#1e3a8a",
    marginBottom: 8,
  },

  featureDesc: {
    fontSize: 14,
    fontWeight: 500,
    color: "#475569",
    lineHeight: 1.65,
  },

  hr: {
    height: 1,
    background: "rgba(147, 197, 253, 0.65)",
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
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid #bfdbfe",
  },

  smallTitle: {
    margin: "0 0 12px",
    fontSize: 16,
    fontWeight: 900,
    color: "#1e3a8a",
  },

  list: {
    margin: 0,
    paddingLeft: 20,
    color: "#475569",
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
    background: "linear-gradient(135deg, #93c5fd, #a78bfa)",
    color: "#0f172a",
    textDecoration: "none",
    fontWeight: 900,
    boxShadow: "0 12px 28px rgba(96, 165, 250, 0.35)",
  },

  btnOutline: {
    padding: "11px 16px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.72)",
    border: "1px solid #bfdbfe",
    color: "#1e3a8a",
    textDecoration: "none",
    fontWeight: 900,
  },

  footerNote: {
    width: "100%",
    marginTop: 16,
    padding: 18,
    borderRadius: 18,
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid rgba(147, 197, 253, 0.45)",
    boxShadow: "0 16px 40px rgba(96, 165, 250, 0.18)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    boxSizing: "border-box",
  },

  footerTitle: {
    fontSize: 14,
    fontWeight: 900,
    color: "#1e3a8a",
    marginBottom: 7,
  },

  footerText: {
    fontSize: 14,
    fontWeight: 500,
    color: "#475569",
    lineHeight: 1.7,
  },
};