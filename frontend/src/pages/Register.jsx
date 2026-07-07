import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [idFile, setIdFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!idFile) {
      setError("Please upload your ID document.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("fullName", form.fullName.trim());
      formData.append("email", form.email.trim());
      formData.append("password", form.password);
      formData.append("idFile", idFile);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();

      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        console.error("Backend returned non-JSON response:", text);
        setError("Backend is not responding correctly. Check backend terminal.");
        return;
      }

      if (!res.ok) {
        setError(data.error || data.message || "Registration failed");
        return;
      }

      navigate("/approve");
    } catch (err) {
      console.error("Register request failed:", err);
      setError("Cannot connect to backend. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoBox}>T</div>

        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>
          Register your account to browse, plan, and book trips.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Full Name</label>
          <input
            type="text"
            name="fullName"
            placeholder="Enter your full name"
            value={form.fullName}
            onChange={handleChange}
            required
            style={styles.input}
          />

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
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label style={styles.label}>Upload ID Document</label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={(e) => setIdFile(e.target.files?.[0] || null)}
            required
            style={styles.fileInput}
          />

          {idFile && (
            <p style={styles.fileName}>
              Selected file:{" "}
              <span style={styles.fileNameStrong}>{idFile.name}</span>
            </p>
          )}

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p style={styles.bottomText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Login
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
    width: "100vw",
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
    maxWidth: "460px",
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
    boxShadow: "0 14px 30px rgba(96, 165, 250, 0.35)",
  },

  title: {
    textAlign: "center",
    margin: 0,
    fontSize: "28px",
    fontWeight: 900,
    color: "#1e3a8a",
    letterSpacing: "-0.03em",
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

  fileInput: {
    marginBottom: "10px",
    padding: "12px",
    borderRadius: "14px",
    border: "1px dashed #93c5fd",
    background: "rgba(255,255,255,0.82)",
    color: "#475569",
    fontSize: "13px",
    cursor: "pointer",
  },

  fileName: {
    margin: "0 0 14px",
    fontSize: "13px",
    color: "#475569",
    lineHeight: 1.5,
  },

  fileNameStrong: {
    color: "#2563eb",
    fontWeight: 800,
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
    cursor: "pointer",
    boxShadow: "0 12px 28px rgba(96, 165, 250, 0.35)",
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