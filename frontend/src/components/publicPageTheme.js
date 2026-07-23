import { createAutoFitMinmax } from "../utils/responsive.js";

export const pageTheme = {
  page: {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    minHeight: "100vh",
    paddingTop: 70,
    background:
      "linear-gradient(180deg, rgba(168, 192, 255, 0.55) 0%, rgba(219, 234, 254, 0.82) 46%, rgba(255, 255, 255, 0.94) 100%)",
    color: "#1e293b",
    fontFamily: "Inter, Arial, sans-serif",
    boxSizing: "border-box",
    overflowX: "hidden",
  },

  main: {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    padding:
      "clamp(16px, 4vw, 34px) clamp(10px, 4vw, 26px) clamp(42px, 8vw, 60px)",
    boxSizing: "border-box",
  },

  contentWrapper: {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    margin: "0 auto",
    color: "#1e293b",
    boxSizing: "border-box",
  },

  header: {
    width: "100%",
    minWidth: 0,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 22,
    boxSizing: "border-box",
  },

  titleGroup: {
    flex: "1 1 280px",
    width: "100%",
    maxWidth: 760,
    minWidth: 0,
  },

  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    maxWidth: "100%",
    padding: "7px 12px",
    borderRadius: 999,
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid rgba(147, 197, 253, 0.42)",
    boxShadow: "0 8px 24px rgba(96, 165, 250, 0.16)",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#2563eb",
    boxSizing: "border-box",
    overflowWrap: "anywhere",
  },

  title: {
    maxWidth: "100%",
    margin: 0,
    fontSize: "clamp(28px, 5vw, 34px)",
    fontWeight: 900,
    color: "#1e3a8a",
    letterSpacing: "-0.04em",
    lineHeight: 1.1,
    overflowWrap: "anywhere",
  },

  subtitle: {
    maxWidth: 680,
    margin: "8px 0 0",
    fontSize: "clamp(14px, 2.6vw, 15px)",
    fontWeight: 500,
    color: "#475569",
    lineHeight: 1.7,
    overflowWrap: "anywhere",
  },

  surface: {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    padding: "clamp(16px, 4vw, 24px)",
    borderRadius: "clamp(18px, 4vw, 22px)",
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid rgba(147, 197, 253, 0.45)",
    boxShadow: "0 25px 70px rgba(59, 130, 246, 0.22)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    boxSizing: "border-box",
  },

  softSurface: {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    padding: "clamp(16px, 3vw, 18px)",
    borderRadius: "clamp(16px, 3vw, 18px)",
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid rgba(147, 197, 253, 0.45)",
    boxShadow: "0 16px 40px rgba(96, 165, 250, 0.18)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    boxSizing: "border-box",
  },

  tile: {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    padding: "clamp(16px, 3vw, 18px)",
    borderRadius: "clamp(16px, 3vw, 18px)",
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid #bfdbfe",
    boxShadow: "0 12px 30px rgba(96, 165, 250, 0.18)",
    boxSizing: "border-box",
  },

  iconCircle: {
    width: 38,
    height: 38,
    flexShrink: 0,
    borderRadius: 14,
    background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    fontSize: 18,
    fontWeight: 900,
    marginBottom: 12,
    boxShadow: "0 10px 22px rgba(96, 165, 250, 0.28)",
  },

  sectionTitle: {
    maxWidth: "100%",
    margin: "0 0 16px",
    fontSize: "clamp(18px, 3.8vw, 20px)",
    fontWeight: 900,
    color: "#1e3a8a",
    overflowWrap: "anywhere",
  },

  smallTitle: {
    maxWidth: "100%",
    margin: "0 0 12px",
    fontSize: "clamp(15px, 3vw, 16px)",
    fontWeight: 900,
    color: "#1e3a8a",
    overflowWrap: "anywhere",
  },

  bodyText: {
    maxWidth: "100%",
    margin: 0,
    fontSize: 14,
    fontWeight: 500,
    color: "#475569",
    lineHeight: 1.7,
    overflowWrap: "anywhere",
  },

  divider: {
    width: "100%",
    height: 1,
    background: "rgba(147, 197, 253, 0.65)",
    margin: "22px 0",
  },

  cardGrid: {
    width: "100%",
    minWidth: 0,
    display: "grid",
    gridTemplateColumns: createAutoFitMinmax(230),
    gap: 16,
  },

  infoGrid: {
    width: "100%",
    minWidth: 0,
    display: "grid",
    gridTemplateColumns: createAutoFitMinmax(170),
    gap: 12,
  },

  field: {
    width: "100%",
    minWidth: 0,
    display: "grid",
    gap: 7,
    marginBottom: 16,
    fontWeight: 700,
    color: "#334155",
    boxSizing: "border-box",
  },

  control: {
    display: "block",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid #bfdbfe",
    background: "rgba(255, 255, 255, 0.9)",
    color: "#0f172a",
    outline: "none",
    font: "inherit",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    minHeight: 130,
    resize: "vertical",
  },

  buttonPrimary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    maxWidth: "100%",
    minWidth: 0,
    padding: "12px 16px",
    borderRadius: 14,
    border: "none",
    background: "linear-gradient(135deg, #93c5fd, #a78bfa)",
    color: "#0f172a",
    textDecoration: "none",
    textAlign: "center",
    fontWeight: 900,
    boxShadow: "0 12px 28px rgba(96, 165, 250, 0.35)",
    cursor: "pointer",
    boxSizing: "border-box",
    whiteSpace: "normal",
    overflowWrap: "anywhere",
  },

  buttonSecondary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    maxWidth: "100%",
    minWidth: 0,
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid rgba(147, 197, 253, 0.52)",
    background: "rgba(255, 255, 255, 0.84)",
    color: "#1e3a8a",
    textDecoration: "none",
    textAlign: "center",
    fontWeight: 800,
    cursor: "pointer",
    boxSizing: "border-box",
    whiteSpace: "normal",
    overflowWrap: "anywhere",
  },

  buttonSuccess: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    maxWidth: "100%",
    minWidth: 0,
    padding: "10px 15px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #86efac, #22c55e)",
    color: "#052e16",
    fontWeight: 900,
    cursor: "pointer",
    boxSizing: "border-box",
    whiteSpace: "normal",
  },

  buttonDanger: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    maxWidth: "100%",
    minWidth: 0,
    padding: "10px 15px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #fda4af, #ef4444)",
    color: "#450a0a",
    fontWeight: 900,
    cursor: "pointer",
    boxSizing: "border-box",
    whiteSpace: "normal",
  },

  buttonWarning: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    maxWidth: "100%",
    minWidth: 0,
    padding: "10px 15px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #fde68a, #f59e0b)",
    color: "#451a03",
    fontWeight: 900,
    cursor: "pointer",
    boxSizing: "border-box",
    whiteSpace: "normal",
  },

  actions: {
    width: "100%",
    minWidth: 0,
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    maxWidth: "100%",
    minWidth: 0,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(191, 219, 254, 0.55)",
    border: "1px solid rgba(147, 197, 253, 0.55)",
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: 800,
    boxSizing: "border-box",
    whiteSpace: "normal",
    overflowWrap: "anywhere",
  },

  errorBox: {
    width: "100%",
    maxWidth: "100%",
    padding: "11px 12px",
    borderRadius: 12,
    background: "rgba(248, 113, 113, 0.14)",
    border: "1px solid rgba(248, 113, 113, 0.35)",
    color: "#dc2626",
    marginBottom: 14,
    fontSize: 14,
    fontWeight: 700,
    boxSizing: "border-box",
    overflowWrap: "anywhere",
  },

  successBox: {
    width: "100%",
    maxWidth: "100%",
    padding: "11px 12px",
    borderRadius: 12,
    background: "rgba(74, 222, 128, 0.14)",
    border: "1px solid rgba(74, 222, 128, 0.35)",
    color: "#166534",
    marginBottom: 14,
    fontSize: 14,
    fontWeight: 700,
    boxSizing: "border-box",
    overflowWrap: "anywhere",
  },

  emptyBox: {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    padding: "clamp(22px, 6vw, 30px)",
    borderRadius: 18,
    textAlign: "center",
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid rgba(147, 197, 253, 0.45)",
    boxShadow: "0 16px 40px rgba(96, 165, 250, 0.18)",
    color: "#475569",
    boxSizing: "border-box",
    overflowWrap: "anywhere",
  },
};

export function getStatusBadgeStyle(status) {
  const normalized = String(status || "").toUpperCase();

  if (
    normalized === "APPROVED" ||
    normalized === "COMPLETED" ||
    normalized === "ONGOING"
  ) {
    return {
      ...pageTheme.pill,
      background: "rgba(74, 222, 128, 0.14)",
      border: "1px solid rgba(74, 222, 128, 0.35)",
      color: "#166534",
    };
  }

  if (
    normalized === "REJECTED" ||
    normalized === "CANCELLED"
  ) {
    return {
      ...pageTheme.pill,
      background: "rgba(248, 113, 113, 0.14)",
      border: "1px solid rgba(248, 113, 113, 0.35)",
      color: "#b91c1c",
    };
  }

  if (
    normalized === "PENDING" ||
    normalized === "PLANNED"
  ) {
    return {
      ...pageTheme.pill,
      background: "rgba(250, 204, 21, 0.16)",
      border: "1px solid rgba(250, 204, 21, 0.32)",
      color: "#a16207",
    };
  }

  return pageTheme.pill;
}
