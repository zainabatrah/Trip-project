import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "../Styles/welcome.module.css";

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className={styles.navbar}>
      <div className={`${styles.menu} ${open ? styles.open : ""}`}>
        <div className={styles.leftLinks}>
          <Link to="/" className={styles.link}>
            Home
          </Link>

          <Link to="/about" className={styles.link}>
            About Us
          </Link>

          <Link to="/private-trip" className={styles.link}>
            Private Trip
          </Link>
        </div>

        <div className={styles.rightButtons}>
          <Link to="/login" className={styles.primaryBtn}>
            Login
          </Link>

          <Link to="/register" className={styles.secondaryBtn}>
            Register
          </Link>
        </div>
      </div>

      <div className={styles.hamburger} onClick={() => setOpen(!open)}>
        {open ? "✕" : "☰"}
      </div>
    </nav>
  );
}