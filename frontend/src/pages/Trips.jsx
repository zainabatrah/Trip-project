import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import TopNavbar from "../components/TopNavbar";
import welcomeStyles from "../Styles/welcome.module.css";
import { getTrips } from "../api/trips";

const badgeStyles = {
  BUS: {
    background: "rgba(129, 140, 248, 0.25)",
    color: "#4f46e5",
  },
  VAN: {
    background: "rgba(45, 212, 191, 0.25)",
    color: "#0f766e",
  },
  MINIBUS: {
    background: "rgba(96, 165, 250, 0.25)",
    color: "#2563eb",
  },
  "PRIVATE CAR": {
    background: "rgba(250, 204, 21, 0.28)",
    color: "#a16207",
  },
};

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [search, setSearch] = useState("");
  const [vehicle, setVehicle] = useState("All Vehicles");
  const [sort, setSort] = useState("Latest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTrips() {
      try {
        setLoading(true);
        setError("");

        const data = await getTrips();

        setTrips(data.trips || data || []);
      } catch (err) {
        setError(err.message || "Could not load trips.");
      } finally {
        setLoading(false);
      }
    }

    loadTrips();
  }, []);

  const filteredTrips = useMemo(() => {
    let list = trips.filter((trip) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        trip.title?.toLowerCase().includes(searchValue) ||
        trip.from?.toLowerCase().includes(searchValue) ||
        trip.to?.toLowerCase().includes(searchValue) ||
        trip.category?.toLowerCase().includes(searchValue);

      const matchesVehicle =
        vehicle === "All Vehicles" || trip.vehicle === vehicle;

      return matchesSearch && matchesVehicle;
    });

    if (sort === "Price Low") {
      list = [...list].sort((a, b) => Number(a.price) - Number(b.price));
    }

    if (sort === "Price High") {
      list = [...list].sort((a, b) => Number(b.price) - Number(a.price));
    }

    if (sort === "Latest") {
      list = [...list].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    }

    return list;
  }, [trips, search, vehicle, sort]);

  return (
    <div className={welcomeStyles.body} style={styles.publicPage}>
      <TopNavbar />

      <main style={styles.publicMain}>
        <div style={styles.page}>
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>Trips Inside Lebanon</h1>

              <p style={styles.subtitle}>
                Browse local trips, check details, and view the map before booking.
              </p>
            </div>
          </div>

          <div style={styles.filters}>
            <div style={styles.searchBox}>
              <span style={styles.searchIcon}>⌕</span>

              <input
                style={styles.searchInput}
                placeholder="Search by city, route, or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={styles.selectGroup}>
              <select
                style={styles.select}
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
              >
                <option>All Vehicles</option>
                <option>BUS</option>
                <option>VAN</option>
                <option>MINIBUS</option>
                <option>PRIVATE CAR</option>
              </select>

              <select
                style={styles.select}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option>Latest</option>
                <option>Price Low</option>
                <option>Price High</option>
              </select>
            </div>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          {loading ? (
            <div style={styles.emptyBox}>Loading trips...</div>
          ) : filteredTrips.length === 0 ? (
            <div style={styles.emptyBox}>No trips found.</div>
          ) : (
            <div style={styles.grid}>
              {filteredTrips.map((trip) => {
                const id = trip._id || trip.id;

                return (
                  <div key={id} style={styles.card}>
                    <div style={styles.imageArea}>
                     <img
  src={trip.image || "/Images/Libanon233.jpg"}
  alt={trip.title || "Trip image"}
  style={styles.tripImage}
  onError={(e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "/Images/Libanon233.jpg";
  }}
/>

                      <span
                        style={{
                          ...styles.badge,
                          ...(badgeStyles[trip.vehicle] || {}),
                        }}
                      >
                        {trip.vehicle}
                      </span>
                    </div>

                    <div style={styles.cardBody}>
                      <div style={styles.cardTopRow}>
                        <span style={styles.category}>{trip.category}</span>
                        <span style={styles.rating}>
                          ★ {Number(trip.rating || 0).toFixed(1)}
                        </span>
                      </div>

                      <h2 style={styles.cardTitle}>{trip.title}</h2>

                      <div style={styles.route}>
                        <span style={styles.dot}></span>
                        <span>{trip.from}</span>
                        <span style={styles.line}></span>
                        <span>{trip.to}</span>
                      </div>

                      <p style={styles.description}>{trip.description}</p>

                      <div style={styles.metaGrid}>
                        <span>{trip.date}</span>
                        <span>{trip.time}</span>
                        <span>{trip.duration}</span>
                      </div>

                      <div style={styles.cardDivider} />

                      <div style={styles.bottomRow}>
                        <div>
                          <span style={styles.price}>
                            ${Number(trip.price || 0).toFixed(2)}
                          </span>
                          <span style={styles.perSeat}>/seat</span>
                        </div>

                        <span style={styles.seats}>
                          {trip.seatsLeft} seats left
                        </span>
                      </div>

                      <div style={styles.actions}>
                        <Link to={`/trips/${id}`} style={styles.detailsBtn}>
                          Trip Details
                        </Link>

                        <Link to="/map" style={styles.mapBtn}>
                          View Map
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  publicPage: {
    width: "100%",
    minHeight: "100vh",
    color: "#1e293b",
    fontFamily: "Inter, Arial, sans-serif",
    boxSizing: "border-box",
    overflowX: "hidden",
  },

  publicMain: {
    width: "100%",
    padding: "34px 26px",
    boxSizing: "border-box",
  },

  page: {
    width: "100%",
    maxWidth: 1180,
    margin: "0 auto",
    boxSizing: "border-box",
  },

  header: {
    marginBottom: 28,
  },

  title: {
    margin: 0,
    fontSize: 32,
    fontWeight: 900,
    color: "#1e3a8a",
    letterSpacing: "-0.04em",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#475569",
    fontSize: 15,
    fontWeight: 500,
  },

  filters: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
    marginBottom: 26,
    flexWrap: "wrap",
  },

  searchBox: {
    width: 330,
    height: 46,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 14px",
    borderRadius: 14,
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid #bfdbfe",
    boxShadow: "0 10px 24px rgba(96, 165, 250, 0.14)",
    boxSizing: "border-box",
  },

  searchIcon: {
    color: "#64748b",
    fontSize: 18,
  },

  searchInput: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#0f172a",
    fontSize: 14,
    fontWeight: 600,
  },

  selectGroup: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },

  select: {
    minWidth: 145,
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #bfdbfe",
    background: "rgba(255,255,255,0.75)",
    color: "#0f172a",
    fontSize: 14,
    fontWeight: 800,
    outline: "none",
    boxShadow: "0 10px 24px rgba(96, 165, 250, 0.14)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
    gap: 24,
  },

  card: {
    borderRadius: 20,
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid rgba(147, 197, 253, 0.45)",
    boxShadow: "0 18px 42px rgba(59, 130, 246, 0.2)",
    overflow: "hidden",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
  },

  imageArea: {
    height: 190,
    position: "relative",
    overflow: "hidden",
    background: "#dbeafe",
  },

  tripImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  badge: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: "7px 11px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },

  cardBody: {
    padding: 22,
  },

  cardTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  category: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(96, 165, 250, 0.18)",
    color: "#2563eb",
    fontSize: 12,
    fontWeight: 900,
  },

  rating: {
    color: "#ca8a04",
    fontSize: 13,
    fontWeight: 900,
  },

  cardTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 900,
    color: "#1e3a8a",
  },

  route: {
    marginTop: 14,
    display: "flex",
    alignItems: "center",
    gap: 9,
    color: "#475569",
    fontSize: 14,
    fontWeight: 700,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#6366f1",
  },

  line: {
    width: 24,
    height: 1,
    background: "#94a3b8",
  },

  description: {
    margin: "18px 0 0",
    color: "#475569",
    lineHeight: 1.55,
    fontSize: 14,
    fontWeight: 500,
  },

  metaGrid: {
    marginTop: 16,
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
    color: "#1e3a8a",
    fontSize: 12,
    fontWeight: 900,
  },

  cardDivider: {
    height: 1,
    background: "#bfdbfe",
    margin: "16px 0",
  },

  bottomRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  price: {
    fontSize: 24,
    fontWeight: 900,
    color: "#0891b2",
  },

  perSeat: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: 700,
  },

  seats: {
    fontSize: 13,
    color: "#1e3a8a",
    fontWeight: 900,
  },

  actions: {
    marginTop: 18,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },

  detailsBtn: {
    padding: "12px 14px",
    borderRadius: 14,
    background: "linear-gradient(135deg, #93c5fd, #a78bfa)",
    color: "#0f172a",
    textAlign: "center",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 900,
  },

  mapBtn: {
    padding: "12px 14px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.75)",
    border: "1px solid #bfdbfe",
    color: "#1e3a8a",
    textAlign: "center",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 900,
  },

  emptyBox: {
    padding: 22,
    borderRadius: 18,
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid rgba(147, 197, 253, 0.45)",
    color: "#475569",
    fontWeight: 800,
    textAlign: "center",
  },

  errorBox: {
    marginBottom: 18,
    padding: 13,
    borderRadius: 14,
    background: "rgba(239, 68, 68, 0.15)",
    color: "#dc2626",
    fontWeight: 900,
  },
};