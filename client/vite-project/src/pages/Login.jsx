import { useState } from "react";
import { loginUser } from "../services/api";

function Login({ onLogin, onSwitchToRegister }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      const { token, user } = response.data;

      localStorage.setItem("authToken", token);
      localStorage.setItem("authUser", JSON.stringify(user));

      if (onLogin) {
        onLogin(user);
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-mark">&lt;/&gt;</div>
          <span>Code Forge</span>
        </div>

        <div className="auth-header">
          <p className="auth-eyebrow">USER MANAGEMENT</p>
          <h1>Welcome back</h1>
          <p>Sign in to continue to your Code Forge account.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="auth-message auth-error" role="alert">
              {error}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="login-email">Email address</label>

            <input
              id="login-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-field">
            <div className="field-label-row">
              <label htmlFor="login-password">Password</label>
              <button
                type="button"
                className="text-button"
                onClick={() => setShowPassword((previous) => !previous)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <button
              type="button"
              className="link-button"
              onClick={onSwitchToRegister}
            >
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;