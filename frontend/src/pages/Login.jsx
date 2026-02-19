import { useState } from "react";
import { Link } from "react-router-dom";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
<>
        {/* Header */}
        <div >
          <h1>Welcome Back</h1>
          <p>
            LOGO
          </p>
        </div>

        {/* Form */}
        <form>
          {/* Email */}
          <div>
            <label>Email</label>
            <input
              type="email"
              placeholder="example@email.com"
            />
          </div>

          {/* Password */}
          <div>
            <label>Password</label>
            <div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="********"
               />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Remember */}
          <div>
            <input type="checkbox" />
            <span>
              Remember me
            </span>
          </div>

          {/* Button */}
          <button>
            Sign In
          </button>
        </form>

        {/* Footer */}
        <p>
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-600 font-semibold">
          Sign up
          </Link>

        </p>
</>
  );
}
