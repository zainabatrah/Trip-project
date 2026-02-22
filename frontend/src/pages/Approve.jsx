import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Approve() {
  // Demo status. Later you’ll fetch from backend (GET /api/auth/status)
  const [status, setStatus] = useState("pending"); // pending | approved | rejected
  const [msg, setMsg] = useState("Checking approval status...");

  useEffect(() => {
    // ✅ Demo “polling” logic: simulate checking status
    // Replace with real fetch:
    // const interval = setInterval(async () => { ... }, 5000);
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
            Your registration is under review (including the uploaded ID).
          </p>
        </div>

        <Link to="/" style={styles.backBtn}>← Back</Link>
      </div>

      <div style={styles.card}>
        <div style={styles.statusRow}>
          <span style={styles.statusLabel}>Status</span>

          {isPending && <span style={{ ...styles.badge, ...styles.badgePending }}>Pending</span>}
          {isApproved && <span style={{ ...styles.badge, ...styles.badgeApproved }}>Approved</span>}
          {isRejected && <span style={{ ...styles.badge, ...styles.badgeRejected }}>Rejected</span>}
        </div>

        <p style={styles.infoText}>{msg}</p>

        <div style={styles.hr} />

        <div style={styles.actions}>
          <Link to="/about" style={styles.btnOutline}>About us</Link>

          {/* Example: later you can add contact page */}
          <a href="#" onClick={(e) => e.preventDefault()} style={styles.btn}>
            Contact support
          </a>
        </div>
      </div>

      <div style={styles.tipCard}>
        <p style={styles.tipTitle}>Tip</p>
        <p style={styles.tipText}>
          If it takes too long, contact the organizer/admin and provide the email you registered with.
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    width: "100vw",
    minHeight: "100vh",
    padding: "28px 18px",
    background:
      "linear-gradient(135deg, #b8e1ff 0%, #a7c7ff 45%, #c3b1ff 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  header: {
    width: "100%",
    maxWidth: 820,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },

  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 900,
    color: "#14204a",
  },

  subtitle: {
    margin: "6px 0 0",
    fontSize: 14,
    color: "rgba(20, 32, 74, 0.75)",
    fontWeight: 600,
  },

  backBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.25)",
    border: "1px solid rgba(255,255,255,0.35)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    color: "#14204a",
    textDecoration: "none",
    fontWeight: 800,
    boxShadow: "0 10px 22px rgba(0,0,0,0.12)",
    whiteSpace: "nowrap",
  },

  card: {
    width: "100%",
    maxWidth: 820,
    padding: 22,
    borderRadius: 22,
    background: "rgba(255, 255, 255, 0.22)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.35)",
    boxShadow: "0 20px 45px rgba(0,0,0,0.18)",
  },

  statusRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  statusLabel: {
    fontSize: 14,
    fontWeight: 900,
    color: "#22306a",
  },

  badge: {
    padding: "8px 12px",
    borderRadius: 999,
    fontWeight: 900,
    fontSize: 12,
    letterSpacing: 0.4,
    border: "1px solid rgba(255,255,255,0.55)",
    background: "rgba(255,255,255,0.55)",
    color: "#14204a",
  },

  badgePending: {},
  badgeApproved: { background: "rgba(220, 255, 236, 0.75)", color: "#0b5d2a" },
  badgeRejected: { background: "rgba(255, 225, 230, 0.75)", color: "#8a1021" },

  infoText: {
    marginTop: 12,
    marginBottom: 0,
    fontSize: 14,
    fontWeight: 700,
    color: "rgba(20, 32, 74, 0.85)",
    lineHeight: 1.6,
  },

  hr: {
    height: 1,
    background: "rgba(255,255,255,0.45)",
    margin: "16px 0",
  },

  actions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  btn: {
    padding: "10px 14px",
    borderRadius: 14,
    background: "linear-gradient(135deg, #6ec6ff, #7c83fd)",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 900,
    border: "none",
  },

  btnOutline: {
    padding: "10px 14px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.25)",
    border: "1px solid rgba(255,255,255,0.5)",
    color: "#14204a",
    textDecoration: "none",
    fontWeight: 900,
  },

  tipCard: {
    width: "100%",
    maxWidth: 820,
    marginTop: 14,
    padding: 16,
    borderRadius: 18,
    background: "rgba(255, 255, 255, 0.18)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: "1px solid rgba(255,255,255,0.30)",
    boxShadow: "0 14px 30px rgba(0,0,0,0.12)",
  },

  tipTitle: {
    margin: 0,
    fontSize: 13,
    fontWeight: 900,
    color: "#22306a",
  },

  tipText: {
    margin: "6px 0 0",
    fontSize: 13,
    fontWeight: 650,
    color: "rgba(20, 32, 74, 0.78)",
    lineHeight: 1.6,
  },
};