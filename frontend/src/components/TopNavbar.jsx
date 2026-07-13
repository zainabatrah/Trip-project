import {
  useEffect,
  useState,
} from "react";
import {
  Link,
} from "react-router-dom";
import {
  getAuthenticatedUser,
  getCurrentUser,
  isLoggedIn,
  isOrganizerRole,
  logoutUser,
  subscribeToAuthChanges,
} from "../api/auth.js";
import styles from "../Styles/welcome.module.css";

export default function TopNavbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(
    () => getCurrentUser()
  );
  const profileImage = getProfileImage(user);
  const profileLetter = getProfileLetter(user);
  const isOrganizer =
    isOrganizerRole(
      user?.role
    );
  const dashboardLink =
    isOrganizer
      ? "/approve"
      : "/my-requests";
  const dashboardLabel =
    isOrganizer
      ? "Approve"
      : "My Requests";

  useEffect(
    () =>
      subscribeToAuthChanges(
        setUser
      ),
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function syncUser() {
      if (!isLoggedIn()) {
        if (!cancelled) {
          setUser(null);
        }

        return;
      }

      try {
        const data =
          await getAuthenticatedUser();

        if (!cancelled) {
          setUser(
            data?.user || null
          );
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error.status === 401) {
          logoutUser();
          setUser(null);

          return;
        }

        setUser(getCurrentUser());
      }
    }

    syncUser();

    return () => {
      cancelled = true;
    };
  }, []);

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

            <Link to={dashboardLink} className={styles.link}>
              {dashboardLabel}
            </Link>
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
