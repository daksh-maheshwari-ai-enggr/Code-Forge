import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { getCurrentUser } from "./services/api";

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
      <div className="min-h-screen w-full flex items-center justify-center bg-[#f6f1e8] px-5 py-12">
        <div className="w-full max-w-[280px] rounded-[18px] border border-[#d8d1c5] bg-[#fbf8f2] p-[30px] text-center shadow-[0_18px_45px_rgba(37,35,31,0.09)]">
          <div className="mx-auto h-[30px] w-[30px] rounded-full border-[3px] border-[#d8d1c5] border-t-[#214d37] animate-spin"></div>

          <p className="mt-4 mb-0 text-[#756f65] text-[13px]">
            Checking your session...
          </p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#f6f1e8] px-5 py-12">
        <div className="w-full max-w-[520px] rounded-[18px] border border-[#d8d1c5] bg-[#fbf8f2] p-7 sm:p-[42px] text-center shadow-[0_18px_45px_rgba(37,35,31,0.09)]">
          <div className="flex items-center justify-center gap-3 mb-[34px] text-[20px] font-bold tracking-[-0.02em] text-[#25231f]">
            <div className="w-10 h-10 flex items-center justify-center rounded-[9px] bg-[#214d37] text-white text-[14px] font-extrabold">
              &lt;/&gt;
            </div>

            <span>Code Forge</span>
          </div>

          <div className="w-[82px] h-[82px] mx-auto mb-[22px] flex items-center justify-center rounded-full bg-[#214d37] text-white text-[30px] font-extrabold">
            {user.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <p className="m-0 mb-[9px] text-[#214d37] text-[11px] font-extrabold tracking-[0.14em]">
            AUTHENTICATED USER
          </p>

          <h1 className="m-0 text-[#25231f] text-[30px] tracking-[-0.04em]">
            Welcome, {user.name}
          </h1>

          <p className="mt-2 mb-[14px] text-[#756f65] text-[14px]">
            {user.email}
          </p>

          <div className="inline-flex px-3 py-1.5 rounded-full border border-[#d2b27d] bg-[#f5ead8] text-[#76541f] text-[11px] font-extrabold tracking-[0.08em]">
            {user.role}
          </div>

          {user.bio && (
            <p className="mx-auto mt-[22px] max-w-[420px] text-[#756f65] text-[14px] leading-[1.7]">
              {user.bio}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-7">
            <div className="p-[15px] rounded-[10px] border border-[#d8d1c5] bg-white">
              <span className="block mb-1.5 text-[#978f83] text-[11px]">
                Account
              </span>

              <strong className="block text-[#25231f] text-[13px]">
                Active
              </strong>
            </div>

            <div className="p-[15px] rounded-[10px] border border-[#d8d1c5] bg-white">
              <span className="block mb-1.5 text-[#978f83] text-[11px]">
                Role
              </span>

              <strong className="block text-[#25231f] text-[13px]">
                {user.role}
              </strong>
            </div>
          </div>

          <button
            type="button"
            className="w-full min-h-[50px] rounded-[10px] border border-[#214d37] bg-transparent text-[#214d37] text-[14px] font-extrabold cursor-pointer transition-all hover:bg-[#e7eee8]"
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