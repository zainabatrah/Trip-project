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
      formData.append("fullName", form.fullName);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("idFile", idFile);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      navigate("/approve");
    } catch {
      setError("Server error");
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
            style={styles.fileInput}
          />

          {idFile && (
            <p style={styles.fileName}>
              Selected file: <span style={styles.fileNameStrong}>{idFile.name}</span>
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
    background: "#0f1020",
    color: "#ffffff",
    fontFamily: "Inter, Arial, sans-serif",
    boxSizing: "border-box",
  },

  card: {
    width: "100%",
    maxWidth: "460px",
    padding: "36px",
    borderRadius: "24px",
    background: "#171b33",
    border: "1px solid #293154",
    boxShadow: "0 25px 70px rgba(0,0,0,0.35)",
    boxSizing: "border-box",
  },

  logoBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    margin: "0 auto 18px",
    background: "linear-gradient(135deg, #5b6cff, #31d4c7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    fontSize: 24,
    fontWeight: 900,
    boxShadow: "0 14px 30px rgba(91,108,255,0.35)",
  },

  title: {
    textAlign: "center",
    margin: 0,
    fontSize: "28px",
    fontWeight: 900,
    color: "#f8fafc",
    letterSpacing: "-0.03em",
  },

  subtitle: {
    textAlign: "center",
    margin: "8px 0 26px",
    fontSize: "14px",
    fontWeight: 500,
    color: "#a7b0d8",
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
    color: "#dce6ff",
  },

  input: {
    marginBottom: "16px",
    padding: "13px 14px",
    borderRadius: "14px",
    border: "1px solid #31426d",
    background: "#111a32",
    color: "#f8fafc",
    outline: "none",
    fontSize: "14px",
    fontWeight: 500,
    boxSizing: "border-box",
  },

  fileInput: {
    marginBottom: "10px",
    padding: "12px",
    borderRadius: "14px",
    border: "1px dashed #31426d",
    background: "#111a32",
    color: "#aeb8dd",
    fontSize: "13px",
    cursor: "pointer",
  },

  fileName: {
    margin: "0 0 14px",
    fontSize: "13px",
    color: "#aeb8dd",
    lineHeight: 1.5,
  },

  fileNameStrong: {
    color: "#31d4c7",
    fontWeight: 800,
  },

  button: {
    marginTop: "8px",
    padding: "14px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg, #5b6cff, #31d4c7)",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 12px 28px rgba(91,108,255,0.35)",
  },

  error: {
    padding: "11px 12px",
    borderRadius: "12px",
    background: "rgba(248, 113, 113, 0.14)",
    border: "1px solid rgba(248, 113, 113, 0.35)",
    color: "#f87171",
    margin: "0 0 14px",
    fontSize: "14px",
    textAlign: "center",
    fontWeight: 700,
  },

  bottomText: {
    margin: "20px 0 0",
    textAlign: "center",
    fontSize: "14px",
    color: "#aeb8dd",
  },

  link: {
    color: "#31d4c7",
    textDecoration: "none",
    fontWeight: 900,
  },

  backLink: {
    display: "block",
    marginTop: "14px",
    textAlign: "center",
    color: "#7f8cff",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 800,
  },
};