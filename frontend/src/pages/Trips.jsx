import { useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

const trips = [
  {
    id: 1,
    title: "Beirut City Tour",
    vehicle: "BUS",
    image: "/images/beirut.jpg",
    fallbackImage:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=80",
    from: "Hamra",
    to: "Downtown Beirut",
    description:
      "Explore Beirut’s streets, waterfront, cafes, and cultural landmarks in one comfortable city trip.",
    date: "Sun, Mar 15",
    price: 25.0,
    seatsLeft: 22,
  },
  {
    id: 2,
    title: "Byblos Coastal Escape",
    vehicle: "VAN",
    image: "/images/byblos.jpg",
    fallbackImage:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
    from: "Beirut",
    to: "Byblos",
    description:
      "A coastal trip to Byblos with time to visit the old souk, harbor, castle area, and seaside restaurants.",
    date: "Fri, Mar 20",
    price: 35.0,
    seatsLeft: 14,
  },
  {
    id: 3,
    title: "Cedars Mountain Trip",
    vehicle: "BUS",
    image: "/images/cedars.jpg",
    fallbackImage:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
    from: "Beirut",
    to: "Cedars of God",
    description:
      "A mountain journey to Bcharre and the Cedars area with fresh air, nature views, and photo stops.",
    date: "Wed, Apr 1",
    price: 45.0,
    seatsLeft: 31,
  },
  {
    id: 4,
    title: "Jeita & Harissa Day Trip",
    vehicle: "MINIBUS",
    image: "/images/jeita-harissa.jpg",
    fallbackImage:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
    from: "Beirut",
    to: "Jeita & Harissa",
    description:
      "Visit Jeita Grotto and Harissa in one day with a calm route, scenic stops, and flexible timing.",
    date: "Mon, Apr 7",
    price: 30.0,
    seatsLeft: 18,
  },
  {
    id: 5,
    title: "Tyre Beach & Heritage",
    vehicle: "VAN",
    image: "/images/tyre.jpg",
    fallbackImage:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    from: "Beirut",
    to: "Tyre",
    description:
      "A south Lebanon trip to Tyre with beach views, heritage areas, and time for walking near the coast.",
    date: "Thu, Apr 10",
    price: 40.0,
    seatsLeft: 16,
  },
  {
    id: 6,
    title: "Baalbek Heritage Journey",
    vehicle: "PRIVATE CAR",
    image: "/images/baalbek.jpg",
    fallbackImage:
      "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=900&q=80",
    from: "Beirut",
    to: "Baalbek",
    description:
      "A private route to Baalbek for travelers who want a more flexible heritage and sightseeing experience.",
    date: "Sat, Apr 12",
    price: 70.0,
    seatsLeft: 4,
  },
];

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
  const [search, setSearch] = useState("");
  const [vehicle, setVehicle] = useState("All Vehicles");
  const [sort, setSort] = useState("Latest");

  const filteredTrips = useMemo(() => {
    let list = trips.filter((trip) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        trip.title.toLowerCase().includes(searchValue) ||
        trip.from.toLowerCase().includes(searchValue) ||
        trip.to.toLowerCase().includes(searchValue);

      const matchesVehicle =
        vehicle === "All Vehicles" || trip.vehicle === vehicle;

      return matchesSearch && matchesVehicle;
    });

    if (sort === "Price Low") {
      list = [...list].sort((a, b) => a.price - b.price);
    }

    if (sort === "Price High") {
      list = [...list].sort((a, b) => b.price - a.price);
    }

    return list;
  }, [search, vehicle, sort]);

  return (
    <DashboardLayout>
      <div style={styles.page}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Trips Inside Lebanon</h1>
            <p style={styles.subtitle}>
              Browse local trips across Lebanon and choose your preferred route.
            </p>
          </div>
        </div>

        <div style={styles.filters}>
          <div style={styles.searchBox}>
            <span style={styles.searchIcon}>⌕</span>
            <input
              style={styles.searchInput}
              placeholder="Search Lebanon trips..."
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

        {filteredTrips.length === 0 ? (
          <div style={styles.emptyBox}>No trips found.</div>
        ) : (
          <div style={styles.grid}>
            {filteredTrips.map((trip) => (
              <div key={trip.id} style={styles.card}>
                <div style={styles.imageArea}>
                  <img
                    src={trip.image}
                    alt={trip.title}
                    style={styles.tripImage}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = trip.fallbackImage;
                    }}
                  />

                  <span
                    style={{
                      ...styles.badge,
                      ...badgeStyles[trip.vehicle],
                    }}
                  >
                    {trip.vehicle}
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
                  <p style={styles.date}>{trip.date}</p>

                  <div style={styles.cardDivider} />

                  <div style={styles.bottomRow}>
                    <div>
                      <span style={styles.price}>
                        ${trip.price.toFixed(2)}
                      </span>
                      <span style={styles.perSeat}>/seat</span>
                    </div>

                    <span style={styles.seats}>
                      {trip.seatsLeft} seats left
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

const styles = {
  page: {
    width: "100%",
    color: "#1e293b",
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

  emptyBox: {
    padding: 22,
    borderRadius: 18,
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid rgba(147, 197, 253, 0.45)",
    color: "#475569",
    fontWeight: 800,
    textAlign: "center",
  },
};