import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const user = getStoredUser();

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: "⌂" },
    { label: "Browse Trips", path: "/trips", icon: "🚌" },
    { label: "Private Trip", path: "/private-trip", icon: "🔒" },
    { label: "My Bookings", path: "/bookings", icon: "▱" },
    { label: "Profile", path: "/profile", icon: "♙" },
    { label: "About Us", path: "/about", icon: "ⓘ" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("isRegistered");
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("tripUser");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("tripUserName");
    localStorage.removeItem("tripUserEmail");

    navigate("/login", { replace: true });
  };

  return (
    <div style={styles.layout}>
      <button
        type="button"
        onClick={() => setSidebarOpen((prev) => !prev)}
        style={{
          ...styles.menuButton,
          left: sidebarOpen ? 318 : 18,
        }}
      >
        ☰
      </button>

      <aside
        style={{
          ...styles.sidebar,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <div>
          <div style={styles.logoBox}>
            <div style={styles.logoIcon}>T</div>
            <div style={styles.logoText}>TripManager</div>
          </div>

          <div style={styles.sidebarLine} />

          <nav style={styles.nav}>
            {navItems.map((item) => {
              const active = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    ...styles.navItem,
                    ...(active ? styles.activeNavItem : {}),
                  }}
                >
                  <span style={styles.navIcon}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div style={styles.userBox}>
          <div style={styles.userAvatar}>
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div style={styles.userInfo}>
            <div style={styles.userName}>{user.name}</div>
            <div style={styles.userEmail}>{user.email}</div>
          </div>

          <button type="button" style={styles.logoutBtn} onClick={handleLogout}>
            ↪
          </button>
        </div>
      </aside>

      <main
        style={{
          ...styles.main,
          marginLeft: sidebarOpen ? 300 : 0,
        }}
      >
        {children}
      </main>
    </div>
  );
}

function getStoredUser() {
  const userRaw =
    localStorage.getItem("tripUser") ||
    localStorage.getItem("user") ||
    localStorage.getItem("currentUser");

  try {
    if (userRaw) {
      const user = JSON.parse(userRaw);

      return {
        name:
          user.fullName ||
          user.name ||
          localStorage.getItem("tripUserName") ||
          "User",
        email:
          user.email ||
          localStorage.getItem("tripUserEmail") ||
          "user@email.com",
      };
    }
  } catch {
    // ignore invalid localStorage data
  }

  return {
    name: localStorage.getItem("tripUserName") || "User",
    email: localStorage.getItem("tripUserEmail") || "user@email.com",
  };
}

const styles = {
  layout: {
    width: "100%",
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #dbeafe 0%, #c7d2fe 55%, #e9d5ff 100%)",
    fontFamily: "Inter, Arial, sans-serif",
    overflowX: "hidden",
  },

  menuButton: {
    position: "fixed",
    top: 18,
    zIndex: 2000,
    width: 44,
    height: 44,
    borderRadius: 14,
    border: "1px solid rgba(147, 197, 253, 0.65)",
    background: "rgba(255, 255, 255, 0.92)",
    color: "#1e3a8a",
    fontSize: 22,
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 12px 28px rgba(96, 165, 250, 0.28)",
    transition: "left 0.25s ease",
  },

  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    width: 300,
    height: "100vh",
    padding: "32px 20px 22px",
    background: "rgba(239, 246, 255, 0.94)",
    borderRight: "1px solid rgba(147, 197, 253, 0.55)",
    boxSizing: "border-box",
    zIndex: 1500,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    overflow: "hidden",
    transition: "transform 0.25s ease",
  },

  logoBox: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },

  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 23,
    fontWeight: 900,
  },

  logoText: {
    fontSize: 24,
    fontWeight: 900,
    color: "#2563eb",
  },

  sidebarLine: {
    height: 1,
    background: "rgba(147, 197, 253, 0.65)",
    margin: "28px 0",
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },

  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "14px 18px",
    borderRadius: 14,
    color: "#475569",
    fontSize: 17,
    fontWeight: 900,
    textDecoration: "none",
  },

  activeNavItem: {
    background: "rgba(196, 181, 253, 0.55)",
    color: "#2563eb",
  },

  navIcon: {
    width: 22,
    textAlign: "center",
    fontSize: 15,
  },

  userBox: {
    borderTop: "1px solid rgba(147, 197, 253, 0.65)",
    paddingTop: 22,
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
    color: "#ffffff",
    fontSize: 20,
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  userInfo: {
    minWidth: 0,
    flex: 1,
  },

  userName: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: 900,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  userEmail: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: 700,
    marginTop: 3,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  logoutBtn: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    border: "none",
    background: "rgba(147, 197, 253, 0.45)",
    color: "#334155",
    fontSize: 17,
    cursor: "pointer",
    flexShrink: 0,
  },

  main: {
    minHeight: "100vh",
    padding: "78px 26px 34px",
    boxSizing: "border-box",
    transition: "margin-left 0.25s ease",
    overflowX: "hidden",
  },
};