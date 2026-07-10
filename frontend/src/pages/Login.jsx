import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const data = await loginUser({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (data.user.role === "organizer" || data.user.role === "admin") {
        navigate("/approve", { replace: true });
      } else {
        navigate("/trips", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoBox}>T</div>

        <h2 style={styles.title}>Login</h2>

        <p style={styles.subtitle}>
          Login to continue to your trip account.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email address"
            value={form.email}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
            style={styles.input}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.65 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={styles.bottomText}>
          Do not have an account?{" "}
          <Link to="/register" style={styles.link}>
            Register
          </Link>
        </p>

        <Link to="/" style={styles.backLink}>
          ← Back to home
        </Link>
      </div>
    </div>
  );
}

const styles = {
  page: {
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "24px",
    background:
      "linear-gradient(135deg, #dbeafe 0%, #c7d2fe 55%, #e9d5ff 100%)",
    color: "#1e293b",
    fontFamily: "Inter, Arial, sans-serif",
    boxSizing: "border-box",
  },

  card: {
    width: "100%",
    maxWidth: "430px",
    padding: "36px",
    borderRadius: "24px",
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid rgba(147, 197, 253, 0.45)",
    boxShadow: "0 25px 70px rgba(59, 130, 246, 0.22)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    boxSizing: "border-box",
  },

  logoBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    margin: "0 auto 18px",
    background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    fontSize: 24,
    fontWeight: 900,
  },

  title: {
    textAlign: "center",
    margin: 0,
    fontSize: "28px",
    fontWeight: 900,
    color: "#1e3a8a",
  },

  subtitle: {
    textAlign: "center",
    margin: "8px 0 26px",
    fontSize: "14px",
    fontWeight: 500,
    color: "#475569",
    lineHeight: 1.6,
  },

  form: {
    display: "flex",
    flexDirection: "column",
  },

  label: {
    marginBottom: "7px",
    fontSize: "13px",
    fontWeight: 800,
    color: "#334155",
  },

  input: {
    marginBottom: "16px",
    padding: "13px 14px",
    borderRadius: "14px",
    border: "1px solid #bfdbfe",
    background: "rgba(255,255,255,0.9)",
    color: "#0f172a",
    outline: "none",
    fontSize: "14px",
    fontWeight: 500,
    boxSizing: "border-box",
  },

  button: {
    marginTop: "8px",
    padding: "14px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg, #93c5fd, #a78bfa)",
    color: "#0f172a",
    fontSize: "15px",
    fontWeight: 900,
  },

  error: {
    padding: "11px 12px",
    borderRadius: "12px",
    background: "rgba(248, 113, 113, 0.14)",
    border: "1px solid rgba(248, 113, 113, 0.35)",
    color: "#dc2626",
    margin: "0 0 14px",
    fontSize: "14px",
    textAlign: "center",
    fontWeight: 700,
  },

  bottomText: {
    margin: "20px 0 0",
    textAlign: "center",
    fontSize: "14px",
    color: "#475569",
  },

  link: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: 900,
  },

  backLink: {
    display: "block",
    marginTop: "14px",
    textAlign: "center",
    color: "#6366f1",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 800,
  },
};