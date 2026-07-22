import { Link } from "react-router-dom";
import PublicPageLayout from "../components/PublicPageLayout.jsx";
import { pageTheme } from "../components/publicPageTheme.js";
import { createAutoFitMinmax } from "../utils/responsive.js";

export default function About() {
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

  return (
    <PublicPageLayout
      title="About TripManager"
         showNavbar={false}
      subtitle="TripManager helps users discover trips, request private trips, and manage their travel experience in a simple way."
    >
      <section style={pageTheme.surface}>
        <h2 style={pageTheme.sectionTitle}>What this platform does</h2>

        <div style={pageTheme.cardGrid}>
          {features.map((feature) => (
            <div key={feature.title} style={pageTheme.tile}>
              <div style={pageTheme.iconCircle}>✦</div>
              <div style={styles.featureTitle}>{feature.title}</div>
              <div style={styles.featureDesc}>{feature.desc}</div>
            </div>
          ))}
        </div>

        <div style={pageTheme.divider} />

        <div style={styles.twoCols}>
          <div style={pageTheme.tile}>
            <h3 style={pageTheme.smallTitle}>Key highlights</h3>

            <ul style={styles.list}>
              {highlights.map((item) => (
                <li key={item} style={styles.listItem}>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div style={pageTheme.tile}>
            <h3 style={pageTheme.smallTitle}>How users use it</h3>

            <ol style={styles.list}>
              <li style={styles.listItem}>Create an account.</li>
              <li style={styles.listItem}>Browse available trips.</li>
              <li style={styles.listItem}>
                Request a private trip if needed.
              </li>
              <li style={styles.listItem}>
                Book trips and manage bookings.
              </li>
            </ol>
          </div>
        </div>

        <div style={pageTheme.divider} />

        <div style={pageTheme.actions}>
          <Link to="/trips" style={pageTheme.buttonPrimary}>
            Browse Trips
          </Link>

          <Link to="/private-trip" style={pageTheme.buttonPrimary}>
            Private Trip
          </Link>
        </div>
      </section>

      <div
        style={{
          ...pageTheme.softSurface,
          marginTop: 16,
        }}
      >
        <div style={styles.footerTitle}>Next improvements</div>

        <div style={styles.footerText}>
          Add real-time trip availability, online payments, map view,
          weather widgets, and organizer trip dashboards.
        </div>
      </div>
    </PublicPageLayout>
  );
}

const styles = {
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

  twoCols: {
    display: "grid",
    gridTemplateColumns:
      createAutoFitMinmax(260),
    gap: 18,
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
