import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const email = form.email.trim();

    if (!email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: form.password,
        }),
      });

      const text = await res.text();

      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        setError("Backend returned invalid response.");
        return;
      }

      if (!res.ok) {
        setError(data.error || data.message || "Login failed.");
        return;
      }

      const loggedUser = {
        id: data.user?.id || data.user?._id || null,
        fullName:
          data.user?.fullName ||
          data.user?.name ||
          email.split("@")[0],
        email: data.user?.email || email,
      };

      localStorage.setItem("isRegistered", "true");
      localStorage.setItem("user", JSON.stringify(loggedUser));
      localStorage.setItem("tripUser", JSON.stringify(loggedUser));
      localStorage.setItem("tripUserName", loggedUser.fullName);
      localStorage.setItem("tripUserEmail", loggedUser.email);

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }

      navigate("/trips", { replace: true });
    } catch (err) {
      console.error("Login request failed:", err);
      setError("Cannot connect to backend. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Login to continue to TripManager</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <div className="password-box">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="********"
                value={form.password}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="toggle-btn"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="remember">
            <input type="checkbox" />
            <span>Remember me</span>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="footer-text">
          Don’t have an account? <Link to="/register">Sign up</Link>
        </p>

        <p className="footer-text">
          <Link to="/">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}