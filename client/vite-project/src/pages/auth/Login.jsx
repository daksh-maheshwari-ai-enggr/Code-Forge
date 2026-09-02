import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
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

      login(user);

      if (user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center box-border px-5 py-12 bg-[#f6f1e8]">
      <div className="w-full max-w-[540px] rounded-[18px] border border-[#d8d1c5] bg-[#fbf8f2] p-7 sm:p-[42px] shadow-[0_18px_45px_rgba(37,35,31,0.09)]">
        <div className="flex items-center gap-3 mb-[34px] text-[20px] font-bold tracking-[-0.02em] text-[#25231f]">
          <div className="w-10 h-10 flex items-center justify-center rounded-[9px] bg-[#214d37] text-white text-[14px] font-extrabold">
            &lt;/&gt;
          </div>
          <span>Code Forge</span>
        </div>

        <div className="mb-[30px]">
          <p className="m-0 mb-[9px] text-[#214d37] text-[11px] font-extrabold tracking-[0.14em]">
            USER MANAGEMENT
          </p>

          <h1 className="m-0 text-[#25231f] text-[30px] sm:text-[40px] leading-[1.08] tracking-[-0.045em]">
            Welcome back
          </h1>

          <p className="mt-3 mb-0 text-[#756f65] text-[14px] leading-[1.7]">
            Sign in to continue to your Code Forge account.
          </p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {error && (
            <div
              className="px-3.5 py-3 rounded-[9px] border border-[#e3b5aa] bg-[#f9e9e5] text-[#8c392d] text-[13px] leading-[1.5]"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="login-email"
              className="text-[#3a3731] text-[13px] font-bold"
            >
              Email address
            </label>

            <input
              id="login-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="w-full h-12 box-border rounded-[10px] border border-[#d8d1c5] bg-white px-3.5 text-[#25231f] text-[14px] outline-none transition-all placeholder:text-[#a39b8e] focus:border-[#214d37] focus:ring-[3px] focus:ring-[#214d37]/10"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="login-password"
                className="text-[#3a3731] text-[13px] font-bold"
              >
                Password
              </label>

              <button
                type="button"
                className="border-0 bg-transparent p-0 text-[#214d37] text-[12px] font-bold cursor-pointer hover:text-[#163b29]"
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
              className="w-full h-12 box-border rounded-[10px] border border-[#d8d1c5] bg-white px-3.5 text-[#25231f] text-[14px] outline-none transition-all placeholder:text-[#a39b8e] focus:border-[#214d37] focus:ring-[3px] focus:ring-[#214d37]/10"
            />
          </div>

          <button
            type="submit"
            className="w-full min-h-[50px] rounded-[10px] border border-[#214d37] bg-[#214d37] text-white text-[14px] font-extrabold cursor-pointer shadow-[0_8px_18px_rgba(33,77,55,0.16)] transition-all hover:-translate-y-px hover:bg-[#183d2b] hover:shadow-[0_11px_24px_rgba(33,77,55,0.2)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-[26px] text-center">
          <p className="m-0 text-[#756f65] text-[13px]">
            Don't have an account?{" "}
            <button
              type="button"
              className="border-0 bg-transparent p-0 text-[#214d37] text-[13px] font-extrabold cursor-pointer hover:text-[#163b29]"
              onClick={() => navigate("/register")}
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
