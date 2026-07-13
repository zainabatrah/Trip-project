import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  isOrganizerRole,
  loginUser,
} from "../api/auth.js";
import "./Login.css";
export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await loginUser({
        email,
        password,
      });

      navigate(
        isOrganizerRole(
          data?.user?.role
        )
          ? "/approve"
          : "/trips",
        {
          replace: true,
        }
      );
    } catch (err) {
      console.error("Error:", err);
      setError(
        err?.message ||
          "Login failed"
      );
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              color: "red",
              background: "#ffe6e6",
              border: "1px solid red",
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "15px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {error}
          </div>
        )}

        <form
          className="login-form"
          onSubmit={handleLogin}
          noValidate
        >
          {/* Email */}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password</label>

            <div className="password-box">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
              />

              <button
                type="button"
                className="toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button className="login-btn" type="submit">
  Sign In
</button>

<p className="back-home">
  <Link to="/" className="back-link">
    ← Back to Home
  </Link>
</p>
        </form>

        <p className="footer-text">
          Don’t have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
