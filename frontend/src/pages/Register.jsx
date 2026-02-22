import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
        <h2 style={styles.title}>Create Account</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
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

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  // IMPORTANT: use viewport units so it fills the whole screen even if #root is constrained
  page: {
    width: "100vw",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "24px",
    background:
      "linear-gradient(135deg, #b8e1ff 0%, #a7c7ff 45%, #c3b1ff 100%)",
  },

  card: {
    width: "100%",
    maxWidth: "420px",
    padding: "44px",
    borderRadius: "22px",
    background: "rgba(255, 255, 255, 0.22)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.35)",
    boxShadow: "0 20px 45px rgba(0,0,0,0.18)",
  },

  title: {
    textAlign: "center",
    marginBottom: "28px",
    fontSize: "24px",
    fontWeight: 700,
    color: "#1f2d5c",
  },

  form: {
    display: "flex",
    flexDirection: "column",
  },

  input: {
    marginBottom: "16px",
    padding: "13px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.55)",
    background: "rgba(255,255,255,0.65)",
    outline: "none",
    fontSize: "14px",
  },

  label: {
    marginBottom: "6px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#2b3a75",
  },

  fileInput: {
    marginBottom: "16px",
    color: "#2b3a75",
  },

  button: {
    marginTop: "6px",
    padding: "14px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg, #6ec6ff, #7c83fd)",
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },

  error: {
    color: "#d7263d",
    marginBottom: "12px",
    fontSize: "14px",
    textAlign: "center",
  },
};