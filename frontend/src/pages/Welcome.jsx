import { Link } from "react-router-dom";

export default function Welcome() {
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Trip Management Platform</h1>

      <p style={styles.text}>
        Browse public trips, create private trips, and manage your bookings
        easily.
      </p>

      <div style={styles.buttons}>
        <Link to="/login" style={styles.primaryBtn}>
          Login
        </Link>

        <Link to="/register" style={styles.secondaryBtn}>
          Register
        </Link>

        <Link to="/private-trip" style={styles.secondaryBtn}>
          Private Trip
        </Link>
      </div>

      <div style={{ marginTop: 20 }}>
        <Link to="/about" style={styles.link}>
          About Us
        </Link>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: 30,
    maxWidth: 700,
    margin: "0 auto",
    textAlign: "center",
  },
  title: {
    fontSize: 40,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginBottom: 25,
    opacity: 0.9,
  },
  buttons: {
    display: "flex",
    justifyContent: "center",
    gap: 15,
    flexWrap: "wrap",
  },
  primaryBtn: {
    padding: "10px 18px",
    backgroundColor: "#ffffff",
    color: "#111",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: "bold",
  },
  secondaryBtn: {
    padding: "10px 18px",
    border: "1px solid #ffffff",
    color: "#ffffff",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: "bold",
  },
  link: {
    color: "#cfd8ff",
    textDecoration: "underline",
  },
};
