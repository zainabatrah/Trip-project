import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Approve() {
  // Demo status. Later you can fetch from backend: GET /api/auth/status
  const [status] = useState("pending"); // pending | approved | rejected
  const [msg, setMsg] = useState("Checking approval status...");

  useEffect(() => {
    const t = setTimeout(() => {
      setMsg("Still pending. Please wait for admin verification.");
    }, 800);

    return () => clearTimeout(t);
  }, []);

  const isPending = status === "pending";
  const isApproved = status === "approved";
  const isRejected = status === "rejected";

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Approval Required</h1>
          <p style={styles.subtitle}>
            Your registration is under review, including the uploaded ID.
          </p>
        </div>

        <Link to="/" style={styles.backBtn}>
          ← Back
        </Link>
      </div>

      <div style={styles.card}>
        <div style={styles.iconBox}>
          {isPending && "⏳"}
          {isApproved && "✅"}
          {isRejected && "❌"}
        </div>

        <div style={styles.statusRow}>
          <span style={styles.statusLabel}>Account Status</span>

          {isPending && (
            <span style={{ ...styles.badge, ...styles.badgePending }}>
              Pending
            </span>
          )}

          {isApproved && (
            <span style={{ ...styles.badge, ...styles.badgeApproved }}>
              Approved
            </span>
          )}

          {isRejected && (
            <span style={{ ...styles.badge, ...styles.badgeRejected }}>
              Rejected
            </span>
          )}
        </div>

        <p style={styles.infoText}>{msg}</p>

        <div style={styles.hr} />

        <div style={styles.detailsBox}>
          <h3 style={styles.smallTitle}>What happens next?</h3>

          <ul style={styles.list}>
            <li style={styles.listItem}>
              Admin reviews your registration information.
            </li>
            <li style={styles.listItem}>
              Your uploaded ID is checked for verification.
            </li>
            <li style={styles.listItem}>
              After approval, you can browse and book trips.
            </li>
          </ul>
        </div>

        <div style={styles.hr} />

        <div style={styles.actions}>
          <Link to="/about" style={styles.btnOutline}>
            About us
          </Link>

          <a href="#" onClick={(e) => e.preventDefault()} style={styles.btn}>
            Contact support
          </a>
        </div>
      </div>

      <div style={styles.tipCard}>
        <p style={styles.tipTitle}>Tip</p>
        <p style={styles.tipText}>
          If approval takes too long, contact the organizer or admin and provide
          the email address you registered with.
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    width: "100vw",
    minHeight: "100vh",
    padding: "34px 26px",
    background:
      "linear-gradient(135deg, #dbeafe 0%, #c7d2fe 55%, #e9d5ff 100%)",
    color: "#1e293b",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "Inter, Arial, sans-serif",
    boxSizing: "border-box",
  },

  header: {
    width: "100%",
    maxWidth: 900,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    marginBottom: 22,
  },

  title: {
    margin: 0,
    fontSize: 34,
    fontWeight: 900,
    color: "#1e3a8a",
    letterSpacing: "-0.04em",
  },

  subtitle: {
    margin: "8px 0 0",
    fontSize: 15,
    color: "#475569",
    fontWeight: 500,
    lineHeight: 1.7,
    maxWidth: 650,
  },

  backBtn: {
    padding: "11px 16px",
    borderRadius: 14,
    background: "linear-gradient(135deg, #bfdbfe, #c4b5fd)",
    border: "1px solid rgba(147, 197, 253, 0.55)",
    color: "#0f172a",
    textDecoration: "none",
    fontWeight: 900,
    boxShadow: "0 10px 25px rgba(96, 165, 250, 0.22)",
    whiteSpace: "nowrap",
  },

  card: {
    width: "100%",
    maxWidth: 900,
    padding: 24,
    borderRadius: 22,
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid rgba(147, 197, 253, 0.45)",
    boxShadow: "0 25px 70px rgba(59, 130, 246, 0.22)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    boxSizing: "border-box",
  },

  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 26,
    marginBottom: 18,
    boxShadow: "0 14px 30px rgba(96, 165, 250, 0.35)",
  },

  statusRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  statusLabel: {
    fontSize: 16,
    fontWeight: 900,
    color: "#1e3a8a",
  },

  badge: {
    padding: "8px 13px",
    borderRadius: 999,
    fontWeight: 900,
    fontSize: 12,
    letterSpacing: 0.4,
    border: "1px solid transparent",
  },

  badgePending: {
    background: "rgba(251, 191, 36, 0.18)",
    color: "#92400e",
    border: "1px solid rgba(251, 191, 36, 0.45)",
  },

  badgeApproved: {
    background: "rgba(34, 197, 94, 0.16)",
    color: "#15803d",
    border: "1px solid rgba(34, 197, 94, 0.38)",
  },

  badgeRejected: {
    background: "rgba(248, 113, 113, 0.16)",
    color: "#dc2626",
    border: "1px solid rgba(248, 113, 113, 0.38)",
  },

  infoText: {
    marginTop: 14,
    marginBottom: 0,
    fontSize: 14,
    fontWeight: 500,
    color: "#475569",
    lineHeight: 1.7,
  },

  hr: {
    height: 1,
    background: "rgba(147, 197, 253, 0.65)",
    margin: "22px 0",
  },

  detailsBox: {
    padding: 18,
    borderRadius: 18,
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid #bfdbfe",
  },

  smallTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 900,
    color: "#1e3a8a",
    marginBottom: 12,
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

  actions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  btn: {
    padding: "11px 16px",
    borderRadius: 14,
    background: "linear-gradient(135deg, #93c5fd, #a78bfa)",
    color: "#0f172a",
    textDecoration: "none",
    fontWeight: 900,
    border: "none",
    boxShadow: "0 12px 28px rgba(96, 165, 250, 0.35)",
  },

  btnOutline: {
    padding: "11px 16px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.72)",
    border: "1px solid #bfdbfe",
    color: "#1e3a8a",
    textDecoration: "none",
    fontWeight: 900,
  },

  tipCard: {
    width: "100%",
    maxWidth: 900,
    marginTop: 16,
    padding: 18,
    borderRadius: 18,
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid rgba(147, 197, 253, 0.45)",
    boxShadow: "0 16px 40px rgba(96, 165, 250, 0.18)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    boxSizing: "border-box",
  },

  tipTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 900,
    color: "#1e3a8a",
  },

  tipText: {
    margin: "7px 0 0",
    fontSize: 14,
    fontWeight: 500,
    color: "#475569",
    lineHeight: 1.7,
  },
};