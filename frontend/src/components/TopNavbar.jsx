import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "../Styles/welcome.module.css";

export default function TopNavbar() {
  const [open, setOpen] = useState(false);

  const user = getUserData();
  const profileImage = getProfileImage(user);
  const profileLetter = getProfileLetter(user);

  const isOrganizer =
    user?.role === "organizer" ||
    user?.role === "admin" ||
    localStorage.getItem("userRole") === "organizer";

  return (
    <nav className={styles.navbar}>
      <div className={styles.navInner}>
        <div className={`${styles.menu} ${open ? styles.open : ""}`}>
          <div className={styles.leftLinks}>
            <Link to="/" className={styles.link}>
              Home
            </Link>

            <Link to="/about" className={styles.link}>
              About Us
            </Link>

            <Link to="/trips" className={styles.link}>
              Trips
            </Link>

            <Link to="/private-trip" className={styles.link}>
              Private Trip
            </Link>

            {isOrganizer ? (
              <Link to="/approve" className={styles.link}>
                Approve
              </Link>
            ) : (
              <Link to="/my-requests" className={styles.link}>
                My Requests
              </Link>
            )}
          </div>
        </div>

        <Link to="/profile" className={styles.profileCircle}>
          {profileImage ? (
            <img
              src={profileImage}
              alt="User Profile"
              className={styles.profileImage}
            />
          ) : (
            <span className={styles.profileLetter}>{profileLetter}</span>
          )}
        </Link>

        <button
          type="button"
          className={styles.hamburger}
          onClick={() => setOpen(!open)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>
    </nav>
  );
}

function getUserData() {
  const possibleKeys = ["currentUser", "tripUser", "user"];

  for (const key of possibleKeys) {
    const value = localStorage.getItem(key);

    if (!value || value === "null") continue;

    try {
      return JSON.parse(value);
    } catch {
      return {
        name: value,
      };
    }
  }

  return {
    name: localStorage.getItem("tripUserName") || "User",
    email: localStorage.getItem("tripUserEmail") || "",
    role: localStorage.getItem("userRole") || "client",
  };
}

function getProfileImage(user) {
  return (
    localStorage.getItem("profileImage") ||
    localStorage.getItem("userImage") ||
    localStorage.getItem("avatar") ||
    user?.profileImage ||
    user?.image ||
    user?.avatar ||
    ""
  );
}

function getProfileLetter(user) {
  const name =
    user?.name ||
    user?.username ||
    localStorage.getItem("tripUserName") ||
    localStorage.getItem("userName") ||
    "User";

  return name.charAt(0).toUpperCase();
}