import { Link } from "react-router-dom";

export default function Welcome() {
  return (

  <div style={styles.page}>
      <nav style={styles.navbar}>
         <Link to="/login" style={styles.primaryBtn}>
          Login
        </Link>

        <Link to="/register" style={styles.secondaryBtn}>
          Register
        </Link>
      </nav>
      <h1 style={styles.title}>Trip Management Platform</h1>

      <p style={styles.text}>
        Browse public trips, create private trips, and manage your bookings
        easily.
      </p>

      <div style={styles.buttons}>
      

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
  page:{
    marginTop:-325,
  },
navbar:{
  maxHeight:100,
  
margin: "0 auto",
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
    marginLeft:"1200px",
    backgroundColor: "#ffffff",
    color: "#111",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: "bold",
    fontWeight:600,
      color: rgb(14 165 233 / var(--tw-text-opacity)),
  },
  secondaryBtn: {
   marginLeft:"100px",
    border: "1px solid #0e0d0d",
    color: "#080808",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: "bold",
  },
  link: {
    color: "#cfd8ff",
    textDecoration: "underline",
  },
};
