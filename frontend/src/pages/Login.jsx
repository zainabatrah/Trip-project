import { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-container">
      
      {/* Card */}
      <div className="login-card">

        {/* Header */}
        <div className="login-header">
          <h1>Welcome</h1>
        </div>

        {/* Form */}
        <form className="login-form">

          {/* Email */}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="example@email.com"
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password</label>

            <div className="password-box">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="********"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-btn"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Remember */}
          <div className="remember">
            <input type="checkbox" />
            <span>Remember me</span>
          </div>

          {/* Button */}
          <button className="login-btn">
            Sign In
          </button>
        </form>

        {/* Footer */}
        <p className="footer-text">
          Don’t have an account?{" "}
          <Link to="/register">Sign up</Link>
        </p>

      </div>
    </div>
  );
}