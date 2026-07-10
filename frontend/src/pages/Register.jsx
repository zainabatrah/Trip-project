import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import PublicPageLayout from "../components/PublicPageLayout.jsx";
import { pageTheme } from "../components/publicPageTheme.js";
import {
  isOrganizerRole,
  registerUser,
} from "../api/auth.js";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [idDocument, setIdDocument] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  }

  function handleFileChange(event) {
    const file =
      event.target.files?.[0] || null;

    if (!file) {
      setIdDocument(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      event.target.value = "";
      setIdDocument(null);
      setError(
        "Only JPG, PNG, and PDF files are allowed."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      event.target.value = "";
      setIdDocument(null);
      setError(
        "The ID document cannot exceed 5 MB."
      );
      return;
    }

    setIdDocument(file);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) {
      return;
    }

    const fullName =
      form.fullName.trim();

    const email = form.email
      .trim()
      .toLowerCase();

    if (fullName.length < 2) {
      setError(
        "Full name must contain at least 2 characters."
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      setError(
        "Enter a valid email address."
      );
      return;
    }

    if (form.password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }

    if (!idDocument) {
      setError("Upload your ID document.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();

      formData.append(
        "fullName",
        fullName
      );

      formData.append("email", email);

      formData.append(
        "password",
        form.password
      );

      formData.append(
        "idDocument",
        idDocument
      );

      const data =
        await registerUser(formData);

      navigate(
        isOrganizerRole(
          data.user.role
        )
          ? "/approve"
          : "/trips",
        {
          replace: true,
        }
      );
    } catch (requestError) {
      setError(
        requestError.message ||
          "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicPageLayout
      showHeader={false}
      maxWidth={460}
      mainStyle={styles.main}
    >
      <section style={styles.card}>
        <h1 style={styles.title}>
          Create Account
        </h1>

        {error && (
          <div style={pageTheme.errorBox}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Field
            label="Full name"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            disabled={loading}
          />

          <Field
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            disabled={loading}
          />

          <Field
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            disabled={loading}
          />

          <Field
            label="Confirm password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            disabled={loading}
          />

          <label style={pageTheme.field}>
            <span>ID document</span>

            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
              onChange={handleFileChange}
              disabled={loading}
              style={styles.fileInput}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...pageTheme.buttonPrimary,
              width: "100%",
              opacity: loading ? 0.7 : 1,
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {loading
              ? "Creating account..."
              : "Register"}
          </button>
        </form>

        <p style={styles.bottomText}>
          Already registered?{" "}
          <Link to="/login" style={styles.link}>
            Login
          </Link>
        </p>
      </section>
    </PublicPageLayout>
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  disabled,
}) {
  return (
    <label style={pageTheme.field}>
      <span>{label}</span>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={pageTheme.control}
      />
    </label>
  );
}

const styles = {
  main: {
    minHeight: "calc(100vh - 70px)",
    display: "grid",
    alignItems: "center",
  },

  card: {
    width: "100%",
    padding: 28,
    borderRadius: 20,
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid rgba(147, 197, 253, 0.45)",
    boxShadow: "0 25px 70px rgba(59, 130, 246, 0.22)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
  },

  title: {
    margin: "0 0 18px",
    fontSize: 28,
    fontWeight: 900,
    color: "#1e3a8a",
  },

  fileInput: {
    padding: "12px 0",
    color: "#334155",
  },

  bottomText: {
    margin: "18px 0 0",
    color: "#475569",
  },

  link: {
    color: "#2563eb",
    fontWeight: 900,
  },
};
