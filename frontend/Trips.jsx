import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const trips = [
  {
    id: 1,
    title: "Mountain Adventure",
    country: "USA",
    transportation: "bus",
    tripType: "adventure",
    from: "New York",
    to: "Denver",
    description: "Explore the breathtaking mountain trails with experienced guides",
    date: "2026-03-15",
    price: 149.99,
    duration: 2,
    numberOfTravelers: 48,
    reservedTravelers: 9,
    rating: 4.8,
  },
  {
    id: 2,
    title: "Coastal Express",
    country: "USA",
    transportation: "train",
    tripType: "relax",
    from: "Los Angeles",
    to: "San Francisco",
    description: "A scenic journey along the beautiful coastline",
    date: "2026-03-20",
    price: 89.99,
    duration: 1,
    numberOfTravelers: 60,
    reservedTravelers: 10,
    rating: 4.6,
  },
  {
    id: 3,
    title: "Sky High Journey",
    country: "USA",
    transportation: "flight",
    tripType: "business",
    from: "Chicago",
    to: "Miami",
    description: "Premium flight experience with complimentary meals",
    date: "2026-04-01",
    price: 299.99,
    duration: 1,
    numberOfTravelers: 220,
    reservedTravelers: 40,
    rating: 4.9,
  },
  {
    id: 4,
    title: "Island Escape",
    country: "Greece",
    transportation: "car",
    tripType: "relax",
    from: "Athens",
    to: "Santorini",
    description: "Relaxing sea trip with beautiful island views",
    date: "2026-04-07",
    price: 199.99,
    duration: 2,
    numberOfTravelers: 70,
    reservedTravelers: 8,
    rating: 4.7,
  },
  {
    id: 5,
    title: "City Explorer",
    country: "USA",
    transportation: "bus",
    tripType: "family",
    from: "Boston",
    to: "Washington",
    description: "Comfortable bus trip through historic city routes",
    date: "2026-04-10",
    price: 79.99,
    duration: 1,
    numberOfTravelers: 52,
    reservedTravelers: 8,
    rating: 4.5,
  },
  {
    id: 6,
    title: "Railway Discovery",
    country: "France",
    transportation: "train",
    tripType: "business",
    from: "Paris",
    to: "Berlin",
    description: "Fast train ride with calm views and comfortable seats",
    date: "2026-04-12",
    price: 129.99,
    duration: 1,
    numberOfTravelers: 100,
    reservedTravelers: 12,
    rating: 4.4,
  },
];

function getTransportIcon(type) {
  if (type === "flight") return "✈️";
  if (type === "train") return "🚆";
  if (type === "car") return "🚗";
  return "🚌";
}

function formatTripDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function capitalize(value) {
  const text = String(value || "");
  return text
    ? text.charAt(0).toUpperCase() + text.slice(1)
    : "";
}

function seatsLeft(trip) {
  return Math.max(
    Number(trip.numberOfTravelers || 0) -
      Number(trip.reservedTravelers || 0),
    0
  );
}

export default function Trips() {
  const [search, setSearch] = useState("");
  const [transportation, setTransportation] = useState("all");
  const [sort, setSort] = useState("Latest");

  const filteredTrips = useMemo(() => {
    let list = trips.filter((trip) => {
      const matchesSearch =
        trip.title.toLowerCase().includes(search.toLowerCase()) ||
        trip.from.toLowerCase().includes(search.toLowerCase()) ||
        trip.to.toLowerCase().includes(search.toLowerCase());

      const matchesTransportation =
        transportation === "all" ||
        trip.transportation === transportation;

      return matchesSearch && matchesTransportation;
    });

    if (sort === "Price Low") {
      list = [...list].sort((a, b) => a.price - b.price);
    }

    if (sort === "Price High") {
      list = [...list].sort((a, b) => b.price - a.price);
    }

    return list;
  }, [search, transportation, sort]);

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logoRow}>
          <div style={styles.logoBox}>T</div>
          <span style={styles.logoText}>TripManager</span>
        </div>

        <div style={styles.divider} />

        <nav style={styles.nav}>
          <Link to="/dashboard" style={styles.navItem}>
            <span style={styles.navIcon}>⌂</span>
            Dashboard
          </Link>

          <Link to="/trips" style={{ ...styles.navItem, ...styles.navActive }}>
            <span style={styles.navIcon}>🗺</span>
            Browse Trips
          </Link>

          <Link to="/bookings" style={styles.navItem}>
            <span style={styles.navIcon}>▱</span>
            My Bookings
          </Link>

          <Link to="/profile" style={styles.navItem}>
            <span style={styles.navIcon}>♙</span>
            Profile
          </Link>
        </nav>

        <div style={styles.userBox}>
          <div style={styles.userAvatar}>Z</div>
          <div>
            <div style={styles.userName}>zizo atrah</div>
            <div style={styles.userRole}>User</div>
          </div>
          <button style={styles.logoutBtn}>↪</button>
        </div>
      </aside>

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Browse Trips</h1>
            <p style={styles.subtitle}>Find your perfect journey</p>
          </div>
        </div>

        <div style={styles.filters}>
          <div style={styles.searchBox}>
            <span style={styles.searchIcon}>⌕</span>
            <input
              style={styles.searchInput}
              placeholder="Search trips..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={styles.selectGroup}>
            <select
              style={styles.select}
              value={transportation}
              onChange={(e) => setTransportation(e.target.value)}
            >
              <option value="all">All Transportation</option>
              <option value="bus">Bus</option>
              <option value="train">Train</option>
              <option value="flight">Flight</option>
              <option value="car">Car</option>
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

        <div style={styles.grid}>
          {filteredTrips.map((trip) => (
            <div key={trip.id} style={styles.card}>
              <div style={styles.imageArea}>
                <span style={styles.tripIcon}>
                  {getTransportIcon(trip.transportation)}
                </span>
                <span
                  style={{
                    ...styles.badge,
                    ...(trip.transportation === "bus" ? styles.badgeBus : {}),
                    ...(trip.transportation === "train" ? styles.badgeTrain : {}),
                    ...(trip.transportation === "flight" ? styles.badgeFlight : {}),
                    ...(trip.transportation === "car" ? styles.badgeShip : {}),
                  }}
                >
                  {capitalize(trip.transportation)}
                </span>
              </div>

              <div style={styles.cardBody}>
                <h2 style={styles.cardTitle}>{trip.title}</h2>

                <div style={styles.route}>
                  <span style={styles.dot}></span>
                  <span>{trip.from}</span>
                  <span style={styles.line}></span>
                  <span>{trip.to}</span>
                </div>

                <p style={styles.description}>{trip.description}</p>
                <p style={styles.date}>
                  {formatTripDate(trip.date)}
                </p>

                <div style={styles.cardDivider} />

                <div style={styles.bottomRow}>
                  <div>
                    <span style={styles.price}>${trip.price}</span>
                    <span style={styles.perSeat}>/seat</span>
                  </div>

                  <span style={styles.seats}>
                    {seatsLeft(trip)} seats left
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: {
    width: "100vw",
    minHeight: "100vh",
    display: "flex",
    background:
      "linear-gradient(135deg, #dbeafe 0%, #c7d2fe 55%, #e9d5ff 100%)",
    color: "#1e293b",
    fontFamily: "Inter, Arial, sans-serif",
    boxSizing: "border-box",
  },

  sidebar: {
    width: 280,
    minHeight: "100vh",
    padding: "26px 18px",
    background: "rgba(255, 255, 255, 0.58)",
    borderRight: "1px solid rgba(147, 197, 253, 0.45)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
  },

  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  logoBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    fontWeight: 900,
    boxShadow: "0 12px 28px rgba(96, 165, 250, 0.3)",
  },

  logoText: {
    color: "#2563eb",
    fontSize: 21,
    fontWeight: 900,
  },

  divider: {
    height: 1,
    background: "rgba(147, 197, 253, 0.5)",
    margin: "28px 0",
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "13px 14px",
    borderRadius: 12,
    color: "#475569",
    textDecoration: "none",
    fontSize: 15,
    fontWeight: 800,
  },

  navActive: {
    background: "linear-gradient(135deg, rgba(147, 197, 253, 0.65), rgba(196, 181, 253, 0.65))",
    color: "#1d4ed8",
    boxShadow: "0 10px 24px rgba(96, 165, 250, 0.2)",
  },

  navIcon: {
    width: 22,
    display: "inline-flex",
    justifyContent: "center",
  },

  userBox: {
    marginTop: "auto",
    paddingTop: 22,
    borderTop: "1px solid rgba(147, 197, 253, 0.5)",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #fde68a, #facc15)",
    color: "#ffffff",
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  userName: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: 900,
  },

  userRole: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: 700,
  },

  logoutBtn: {
    marginLeft: "auto",
    background: "transparent",
    border: "none",
    color: "#64748b",
    fontSize: 18,
    cursor: "pointer",
  },

  main: {
    flex: 1,
    padding: "38px 34px",
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
  },

  searchBox: {
    width: 290,
    height: 44,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 14px",
    borderRadius: 12,
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid #bfdbfe",
    boxShadow: "0 10px 24px rgba(96, 165, 250, 0.14)",
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
    minHeight: 390,
    borderRadius: 18,
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid rgba(147, 197, 253, 0.45)",
    boxShadow: "0 18px 42px rgba(59, 130, 246, 0.2)",
    overflow: "hidden",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
  },

  imageArea: {
    height: 172,
    background:
      "linear-gradient(135deg, rgba(191, 219, 254, 0.75), rgba(196, 181, 253, 0.75))",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  tripIcon: {
    fontSize: 42,
    opacity: 0.75,
  },

  badge: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: "7px 11px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
  },

  badgeBus: {
    background: "rgba(129, 140, 248, 0.25)",
    color: "#4f46e5",
  },

  badgeTrain: {
    background: "rgba(45, 212, 191, 0.25)",
    color: "#0f766e",
  },

  badgeFlight: {
    background: "rgba(96, 165, 250, 0.25)",
    color: "#2563eb",
  },

  badgeShip: {
    background: "rgba(250, 204, 21, 0.28)",
    color: "#a16207",
  },

  cardBody: {
    padding: 22,
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

  date: {
    margin: "14px 0 0",
    color: "#64748b",
    fontSize: 13,
    fontWeight: 700,
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
};
