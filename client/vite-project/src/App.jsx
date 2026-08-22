import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { getCurrentUser } from "./services/api";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("login");
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setCheckingAuth(false);
      return;
    }

    const restoreSession = async () => {
      try {
        const response = await getCurrentUser(token);
        const currentUser = response.data.user;

        setUser(currentUser);
        localStorage.setItem("authUser", JSON.stringify(currentUser));
      } catch {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    restoreSession();
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleRegister = (registeredUser) => {
    setUser(registeredUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setUser(null);
    setCurrentPage("login");
  };

  if (checkingAuth) {
    return (
      <div className="loading-screen">
        <div className="loading-card">
          <div className="loading-spinner"></div>
          <p>Checking your session...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <div className="profile-brand">
            <div className="brand-mark">&lt;/&gt;</div>
            <span>Code Forge</span>
          </div>

          <div className="profile-avatar">
            {user.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <p className="auth-eyebrow">AUTHENTICATED USER</p>

          <h1>Welcome, {user.name}</h1>

          <p className="profile-email">{user.email}</p>

          <div className="profile-role">
            {user.role}
          </div>

          {user.bio && (
            <p className="profile-bio">
              {user.bio}
            </p>
          )}

          <div className="profile-details">
            <div>
              <span>Account</span>
              <strong>Active</strong>
            </div>

            <div>
              <span>Role</span>
              <strong>{user.role}</strong>
            </div>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (currentPage === "register") {
    return (
      <Register
        onRegister={handleRegister}
        onSwitchToLogin={() => setCurrentPage("login")}
      />
    );
  }

  return (
    <Login
      onLogin={handleLogin}
      onSwitchToRegister={() => setCurrentPage("register")}
    />
  );
}

export default App;