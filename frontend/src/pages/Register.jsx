import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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

  const [idDocument, setIdDocument] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    setError("");
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null;

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

    const maximumFileSize = 5 * 1024 * 1024;

    if (file.size > maximumFileSize) {
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

    const fullName = form.fullName.trim();
    const email = form.email.trim().toLowerCase();

    if (fullName.length < 2) {
      setError(
        "Full name must contain at least 2 characters."
      );
      return;
    }

    const validEmail =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!validEmail.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (form.password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
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

      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("password", form.password);
      formData.append("idDocument", idDocument);

      const data = await registerUser(formData);

      const destination = isOrganizerRole(
        data.user.role
      )
        ? "/approve"
        : "/trips";

      navigate(destination, {
        replace: true,
      });
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="register-page">
      <div className="background-shape shape-one" />
      <div className="background-shape shape-two" />

      <button
        type="button"
        className="back-button"
        onClick={() => navigate("/")}
        disabled={loading}
      >
        <span aria-hidden="true">←</span>
        Back to welcome
      </button>

      <div className="register-container">
        <section className="register-introduction">
          <div className="introduction-content">
            <span className="page-badge">
              CREATE YOUR ACCOUNT
            </span>

            <h1>
              Your next journey starts here.
            </h1>

            <p className="introduction-description">
              Create an account to explore trips,
              submit private trip requests, and
              communicate directly with trip
              organizers.
            </p>

            <div className="feature-list">
              <Feature
                number="01"
                title="Discover trips"
                description="Browse destinations and organized travel experiences."
              />

              <Feature
                number="02"
                title="Request private trips"
                description="Send your route, dates, group size, and budget."
              />

              <Feature
                number="03"
                title="Track your requests"
                description="Receive organizer responses and follow each request."
              />
            </div>
          </div>

          <div className="security-message">
            <div className="security-icon">
              ✓
            </div>

            <div>
              <strong>
                Secure account verification
              </strong>

              <span>
                Your identification document is
                reviewed securely.
              </span>
            </div>
          </div>
        </section>

        <section className="register-form-section">
          <div className="register-card">
            <div className="form-heading">
              <span className="form-label">
                REGISTRATION
              </span>

              <h2>Create your account</h2>

              <p>
                Enter your information to access the
                trip platform.
              </p>
            </div>

            {error && (
              <div
                className="error-message"
                role="alert"
              >
                <span aria-hidden="true">!</span>
                <p>{error}</p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="form-grid">
                <Field
                  label="Full name"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="name"
                />

                <Field
                  label="Email address"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="email"
                />

                <PasswordField
                  label="Password"
                  name="password"
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                  visible={showPassword}
                  onToggle={() =>
                    setShowPassword(
                      (currentValue) =>
                        !currentValue
                    )
                  }
                  autoComplete="new-password"
                />

                <PasswordField
                  label="Confirm password"
                  name="confirmPassword"
                  placeholder="Enter password again"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  visible={showConfirmPassword}
                  onToggle={() =>
                    setShowConfirmPassword(
                      (currentValue) =>
                        !currentValue
                    )
                  }
                  autoComplete="new-password"
                />
              </div>

              <div className="document-section">
                <div className="document-heading">
                  <div>
                    <label htmlFor="idDocument">
                      Identification document
                    </label>

                    <p>
                      Upload a clear JPG, PNG, or PDF
                      file.
                    </p>
                  </div>

                  <span>Maximum 5 MB</span>
                </div>

                <label
                  htmlFor="idDocument"
                  className={`upload-area ${
                    idDocument
                      ? "file-selected"
                      : ""
                  }`}
                >
                  <input
                    id="idDocument"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                    onChange={handleFileChange}
                    disabled={loading}
                  />

                  <span className="upload-icon">
                    {idDocument ? "✓" : "↑"}
                  </span>

                  <span className="upload-content">
                    <strong>
                      {idDocument
                        ? idDocument.name
                        : "Choose an ID document"}
                    </strong>

                    <small>
                      {idDocument
                        ? `${formatFileSize(
                            idDocument.size
                          )} selected`
                        : "Click to select a file"}
                    </small>
                  </span>

                  <span className="browse-button">
                    Browse
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="register-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <span aria-hidden="true">
                      →
                    </span>
                  </>
                )}
              </button>
            </form>

            <div className="login-link">
              Already have an account?{" "}
              <Link to="/login">
                Log in
              </Link>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        .register-page {
          --dark-text: #17213f;
          --navy: #1d2b55;
          --blue: #62bdf7;
          --purple: #b989f4;

          position: relative;
          min-height: 100vh;
          overflow: hidden;
          padding: 28px;

          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

          background:
            radial-gradient(
              circle at 8% 12%,
              rgba(101, 192, 255, 0.2),
              transparent 34%
            ),
            radial-gradient(
              circle at 91% 85%,
              rgba(190, 139, 247, 0.23),
              transparent 37%
            ),
            linear-gradient(
              135deg,
              #d8e5ff 0%,
              #cfddff 45%,
              #e0e6ff 100%
            );

          color: var(--dark-text);
        }

        .background-shape {
          position: absolute;
          border-radius: 999px;
          pointer-events: none;
          filter: blur(3px);
        }

        .shape-one {
          top: -170px;
          right: -80px;
          width: 440px;
          height: 440px;

          background:
            linear-gradient(
              135deg,
              rgba(100, 194, 255, 0.28),
              rgba(187, 137, 247, 0.25)
            );
        }

        .shape-two {
          bottom: -180px;
          left: -100px;
          width: 420px;
          height: 420px;

          background:
            linear-gradient(
              135deg,
              rgba(103, 139, 255, 0.2),
              rgba(201, 150, 250, 0.24)
            );
        }

        .back-button {
          position: relative;
          z-index: 2;

          display: inline-flex;
          align-items: center;
          gap: 9px;

          margin-bottom: 20px;
          padding: 10px 15px;

          border: 1px solid
            rgba(111, 132, 230, 0.28);

          border-radius: 12px;

          background:
            linear-gradient(
              135deg,
              rgba(118, 196, 250, 0.68),
              rgba(194, 151, 246, 0.68)
            );

          color: var(--dark-text);
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;

          box-shadow:
            0 10px 25px
            rgba(80, 91, 180, 0.14);

          backdrop-filter: blur(12px);

          transition:
            transform 160ms ease,
            box-shadow 160ms ease,
            filter 160ms ease;
        }

        .back-button:hover:not(:disabled) {
          transform: translateX(-3px);
          filter: brightness(1.04);

          box-shadow:
            0 14px 30px
            rgba(80, 91, 180, 0.2);
        }

        .back-button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .back-button span {
          font-size: 20px;
          line-height: 1;
        }

        .register-container {
          position: relative;
          z-index: 1;

          display: grid;
          grid-template-columns:
            minmax(360px, 0.9fr)
            minmax(480px, 1.1fr);

          width: 100%;
          max-width: 1180px;
          min-height: calc(100vh - 104px);

          margin: 0 auto;
          overflow: hidden;

          border: 1px solid
            rgba(255, 255, 255, 0.72);

          border-radius: 30px;

          background:
            rgba(237, 243, 255, 0.72);

          box-shadow:
            0 35px 90px
            rgba(69, 79, 170, 0.2);

          backdrop-filter: blur(18px);
        }

        .register-introduction {
          position: relative;

          display: flex;
          flex-direction: column;
          justify-content: space-between;

          padding: 50px 46px 40px;

          background:
            linear-gradient(
              145deg,
              #62c3fa 0%,
              #7488fa 48%,
              #bd8bf4 100%
            );

          color: var(--dark-text);
        }

        .register-introduction::before {
          content: "";

          position: absolute;
          top: -90px;
          right: -100px;

          width: 280px;
          height: 280px;

          border-radius: 50%;
          background:
            rgba(255, 255, 255, 0.14);

          pointer-events: none;
        }

        .register-introduction::after {
          content: "";

          position: absolute;
          bottom: -110px;
          left: -90px;

          width: 270px;
          height: 270px;

          border-radius: 50%;
          background:
            rgba(95, 186, 255, 0.17);

          pointer-events: none;
        }

        .introduction-content,
        .security-message {
          position: relative;
          z-index: 1;
        }

        .page-badge {
          display: inline-flex;
          width: fit-content;

          margin-bottom: 22px;
          padding: 8px 13px;

          border: 1px solid
            rgba(23, 33, 63, 0.14);

          border-radius: 999px;

          background:
            rgba(255, 255, 255, 0.24);

          color: var(--navy);

          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.12em;
        }

        .register-introduction h1 {
          max-width: 470px;
          margin: 0;

          color: var(--dark-text);

          font-size: clamp(
            38px,
            4vw,
            56px
          );

          line-height: 1.04;
          letter-spacing: -0.045em;

          text-shadow:
            0 2px 10px
            rgba(255, 255, 255, 0.18);
        }

        .introduction-description {
          max-width: 470px;

          margin: 22px 0 34px;

          color:
            rgba(23, 33, 63, 0.78);

          font-size: 15px;
          font-weight: 500;
          line-height: 1.7;
        }

        .feature-list {
          display: grid;
          gap: 14px;
        }

        .feature-item {
          display: grid;
          grid-template-columns: 44px 1fr;
          gap: 14px;
          align-items: start;

          padding: 14px;

          border: 1px solid
            rgba(255, 255, 255, 0.32);

          border-radius: 16px;

          background:
            rgba(255, 255, 255, 0.2);

          box-shadow:
            0 10px 24px
            rgba(49, 59, 140, 0.1);

          backdrop-filter: blur(10px);

          transition:
            transform 160ms ease,
            background 160ms ease,
            box-shadow 160ms ease;
        }

        .feature-item:hover {
          transform: translateY(-2px);

          background:
            rgba(255, 255, 255, 0.28);

          box-shadow:
            0 14px 28px
            rgba(49, 59, 140, 0.14);
        }

        .feature-number {
          display: grid;
          place-items: center;

          width: 44px;
          height: 44px;

          border-radius: 13px;

          background:
            rgba(22, 31, 62, 0.9);

          color: #9fa8ff;

          font-size: 12px;
          font-weight: 900;

          box-shadow:
            0 8px 18px
            rgba(26, 37, 80, 0.2);
        }

        .feature-item strong {
          display: block;

          margin-bottom: 4px;

          color: var(--dark-text);

          font-size: 15px;
          font-weight: 850;
        }

        .feature-item p {
          margin: 0;

          color:
            rgba(23, 33, 63, 0.72);

          font-size: 13px;
          line-height: 1.5;
        }

        .security-message {
          display: flex;
          gap: 13px;
          align-items: center;

          margin-top: 30px;
          padding-top: 22px;

          border-top: 1px solid
            rgba(23, 33, 63, 0.15);
        }

        .security-icon {
          display: grid;
          place-items: center;
          flex-shrink: 0;

          width: 38px;
          height: 38px;

          border-radius: 50%;

          background:
            rgba(22, 31, 62, 0.9);

          color: #a2abff;

          font-weight: 900;

          box-shadow:
            0 8px 18px
            rgba(27, 38, 82, 0.2);
        }

        .security-message strong,
        .security-message span {
          display: block;
        }

        .security-message strong {
          margin-bottom: 3px;

          color: var(--dark-text);

          font-size: 13px;
        }

        .security-message span {
          color:
            rgba(23, 33, 63, 0.7);

          font-size: 12px;
        }

        .register-form-section {
          display: grid;
          place-items: center;

          padding: 44px 48px;

          background:
            linear-gradient(
              145deg,
              rgba(240, 245, 255, 0.94),
              rgba(225, 232, 255, 0.88)
            );
        }

        .register-card {
          width: 100%;
          max-width: 570px;
        }

        .form-heading {
          margin-bottom: 25px;
        }

        .form-label {
          display: block;

          margin-bottom: 8px;

          color: #6978ec;

          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.12em;
        }

        .form-heading h2 {
          margin: 0 0 8px;

          background:
            linear-gradient(
              90deg,
              #557af2,
              #a678ec
            );

          background-clip: text;
          -webkit-background-clip: text;

          color: transparent;

          font-size: 34px;
          line-height: 1.15;
          letter-spacing: -0.035em;
        }

        .form-heading p {
          margin: 0;

          color: #58657d;

          font-size: 14px;
          line-height: 1.6;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 11px;

          margin-bottom: 18px;
          padding: 12px 14px;

          border: 1px solid #f3a5bd;
          border-radius: 12px;

          background:
            rgba(255, 230, 239, 0.9);

          color: #9d2447;
        }

        .error-message span {
          display: grid;
          place-items: center;
          flex-shrink: 0;

          width: 22px;
          height: 22px;

          border-radius: 50%;

          background: #bd3b62;
          color: #ffffff;

          font-size: 12px;
          font-weight: 900;
        }

        .error-message p {
          margin: 0;

          font-size: 13px;
          font-weight: 650;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 17px;
        }

        .form-field {
          display: grid;
          gap: 7px;
        }

        .form-field label {
          color: var(--navy);

          font-size: 13px;
          font-weight: 800;
        }

        .form-control {
          width: 100%;
          height: 49px;

          padding: 0 14px;

          border: 1px solid
            rgba(108, 129, 220, 0.32);

          border-radius: 12px;
          outline: none;

          background:
            rgba(255, 255, 255, 0.76);

          color: var(--dark-text);

          font: inherit;
          font-size: 14px;

          box-shadow:
            0 6px 16px
            rgba(75, 87, 164, 0.05);

          transition:
            border-color 160ms ease,
            box-shadow 160ms ease,
            background 160ms ease;
        }

        .form-control::placeholder {
          color: #8d98ac;
        }

        .form-control:hover:not(:disabled) {
          border-color:
            rgba(114, 128, 237, 0.52);
        }

        .form-control:focus {
          border-color: #7b82f0;

          background: #ffffff;

          box-shadow:
            0 0 0 4px
            rgba(126, 131, 241, 0.14);
        }

        .form-control:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .password-wrapper {
          position: relative;
        }

        .password-wrapper .form-control {
          padding-right: 62px;
        }

        .password-toggle {
          position: absolute;
          top: 50%;
          right: 10px;

          transform: translateY(-50%);

          padding: 5px;

          border: 0;
          background: transparent;

          color: #6978e8;

          font-size: 12px;
          font-weight: 850;
          cursor: pointer;
        }

        .password-toggle:hover:not(:disabled) {
          color: #8d61dc;
        }

        .password-toggle:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .document-section {
          margin-top: 21px;
        }

        .document-heading {
          display: flex;
          justify-content: space-between;
          gap: 20px;

          margin-bottom: 9px;
        }

        .document-heading label {
          display: block;

          margin-bottom: 3px;

          color: var(--navy);

          font-size: 13px;
          font-weight: 800;
        }

        .document-heading p {
          margin: 0;

          color: #758199;

          font-size: 12px;
        }

        .document-heading > span {
          align-self: flex-end;

          color: #758199;

          font-size: 11px;
          white-space: nowrap;
        }

        .upload-area {
          position: relative;

          display: grid;
          grid-template-columns:
            44px minmax(0, 1fr) auto;

          gap: 14px;
          align-items: center;

          min-height: 76px;
          padding: 13px 14px;

          border: 1.5px dashed
            rgba(111, 127, 226, 0.58);

          border-radius: 15px;

          background:
            linear-gradient(
              135deg,
              rgba(118, 195, 248, 0.14),
              rgba(189, 140, 243, 0.14)
            );

          cursor: pointer;

          transition:
            border-color 160ms ease,
            background 160ms ease,
            transform 160ms ease,
            box-shadow 160ms ease;
        }

        .upload-area:hover {
          transform: translateY(-1px);
          border-color: #8c79ea;

          background:
            linear-gradient(
              135deg,
              rgba(118, 195, 248, 0.22),
              rgba(189, 140, 243, 0.22)
            );

          box-shadow:
            0 10px 24px
            rgba(93, 92, 184, 0.1);
        }

        .upload-area.file-selected {
          border-style: solid;
          border-color: #7785ec;

          background:
            linear-gradient(
              135deg,
              rgba(118, 195, 248, 0.24),
              rgba(189, 140, 243, 0.24)
            );
        }

        .upload-area input {
          position: absolute;

          width: 1px;
          height: 1px;

          overflow: hidden;
          opacity: 0;
          pointer-events: none;
        }

        .upload-icon {
          display: grid;
          place-items: center;

          width: 44px;
          height: 44px;

          border-radius: 13px;

          background:
            linear-gradient(
              135deg,
              #62bdf7,
              #7e83f5 52%,
              #b783ef
            );

          color: var(--dark-text);

          font-size: 20px;
          font-weight: 900;

          box-shadow:
            0 9px 20px
            rgba(99, 112, 218, 0.23);
        }

        .upload-content {
          min-width: 0;
        }

        .upload-content strong,
        .upload-content small {
          display: block;
        }

        .upload-content strong {
          overflow: hidden;

          margin-bottom: 4px;

          color: var(--navy);

          font-size: 13px;

          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .upload-content small {
          color: #718096;

          font-size: 11px;
        }

        .browse-button {
          padding: 8px 12px;

          border: 1px solid
            rgba(115, 132, 226, 0.3);

          border-radius: 9px;

          background:
            rgba(255, 255, 255, 0.72);

          color: #5e6cda;

          font-size: 12px;
          font-weight: 850;
        }

        .register-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;

          width: 100%;
          height: 53px;

          margin-top: 23px;

          border: 0;
          border-radius: 13px;

          background:
            linear-gradient(
              100deg,
              #61bff7 0%,
              #7586fa 48%,
              #bd8af2 100%
            );

          color: var(--dark-text);

          font-size: 14px;
          font-weight: 900;
          cursor: pointer;

          box-shadow:
            0 16px 30px
            rgba(91, 98, 197, 0.24);

          transition:
            transform 160ms ease,
            box-shadow 160ms ease,
            filter 160ms ease,
            opacity 160ms ease;
        }

        .register-button:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.04);

          box-shadow:
            0 20px 38px
            rgba(91, 98, 197, 0.31);
        }

        .register-button:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .register-button > span:last-child {
          font-size: 19px;
          line-height: 1;
        }

        .spinner {
          width: 18px;
          height: 18px;

          border: 2px solid
            rgba(23, 33, 63, 0.25);

          border-top-color: var(--dark-text);
          border-radius: 50%;

          animation: spin 700ms linear infinite;
        }

        .login-link {
          margin-top: 19px;

          text-align: center;

          color: #647089;

          font-size: 13px;
        }

        .login-link a {
          background:
            linear-gradient(
              90deg,
              #547bf1,
              #9c6fe5
            );

          background-clip: text;
          -webkit-background-clip: text;

          color: transparent;

          font-weight: 900;
          text-decoration: none;
        }

        .login-link a:hover {
          text-decoration: underline;
          text-decoration-color: #7e78e9;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 950px) {
          .register-page {
            padding: 20px;
          }

          .register-container {
            grid-template-columns: 1fr;
          }

          .register-introduction {
            padding: 40px;
          }

          .register-introduction h1 {
            font-size: 43px;
          }

          .feature-list {
            grid-template-columns:
              repeat(3, 1fr);
          }

          .feature-item {
            grid-template-columns: 1fr;
          }

          .register-form-section {
            padding: 42px 40px;
          }
        }

        @media (max-width: 680px) {
          .register-page {
            padding: 14px;
          }

          .back-button {
            margin-bottom: 14px;
          }

          .register-container {
            min-height: auto;
            border-radius: 22px;
          }

          .register-introduction {
            padding: 32px 22px;
          }

          .register-introduction h1 {
            font-size: 37px;
          }

          .introduction-description {
            margin-bottom: 26px;
          }

          .feature-list {
            grid-template-columns: 1fr;
          }

          .feature-item {
            grid-template-columns:
              44px 1fr;
          }

          .register-form-section {
            padding: 32px 20px;
          }

          .form-heading h2 {
            font-size: 29px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .document-heading {
            display: block;
          }

          .document-heading > span {
            display: block;
            margin-top: 5px;
          }

          .upload-area {
            grid-template-columns:
              42px minmax(0, 1fr);
          }

          .browse-button {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  placeholder,
  onChange,
  disabled,
  autoComplete,
}) {
  return (
    <div className="form-field">
      <label htmlFor={name}>
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        disabled={disabled}
        autoComplete={autoComplete}
        className="form-control"
      />
    </div>
  );
}

function PasswordField({
  label,
  name,
  value,
  placeholder,
  onChange,
  disabled,
  visible,
  onToggle,
  autoComplete,
}) {
  return (
    <div className="form-field">
      <label htmlFor={name}>
        {label}
      </label>

      <div className="password-wrapper">
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          disabled={disabled}
          autoComplete={autoComplete}
          className="form-control"
        />

        <button
          type="button"
          className="password-toggle"
          onClick={onToggle}
          disabled={disabled}
          aria-label={
            visible
              ? `Hide ${label}`
              : `Show ${label}`
          }
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

function Feature({
  number,
  title,
  description,
}) {
  return (
    <div className="feature-item">
      <span className="feature-number">
        {number}
      </span>

      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    </div>
  );
}

function formatFileSize(size) {
  if (size < 1024 * 1024) {
    return `${Math.ceil(size / 1024)} KB`;
  }

  return `${(
    size /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}