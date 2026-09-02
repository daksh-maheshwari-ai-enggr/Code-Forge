import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiBookOpen,
  FiGrid,
  FiSearch,
  FiEdit3,
  FiUser,
  FiBell,
} from "react-icons/fi";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: FiGrid,
    },
    {
      name: "Browse",
      path: "/browse",
      icon: FiSearch,
    },
  ];

  const isAuthorView = user?.role === "AUTHOR";

  if (isAuthorView) {
    navItems.push(
      { name: "Write", path: "/author/write", icon: FiEdit3 },
      { name: "Profile", path: "/profile", icon: FiUser },
    );
  }

  if (user?.role === "ADMIN") {
    navItems.push(
      {
        name: "Admin",
        path: "/admin/dashboard",
        icon: FiGrid,
      },
      {
        name: "Profile",
        path: "/profile",
        icon: FiUser,
      }
    );
  }

  const handleLogin = () => navigate("/login");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="w-full bg-[#FBF9F5] border-b border-stone-200/80 px-6 py-3.5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1B3B2B] flex items-center justify-center text-white">
            <FiBookOpen className="w-4 h-4" />
          </div>

          <span className="font-serif text-xl font-bold tracking-tight text-[#1B3B2B]">
            Lumen
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 bg-[#ECE7DC]/70 p-1 rounded-full border border-stone-200/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-2 text-[16px] transition-colors ${
                  isActive
                    ? "text-[#1B3B2B]"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {!user ? (
            <button
              type="button"
              onClick={handleLogin}
              className="inline-flex items-center justify-center rounded-xl bg-[#1B3B2B] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#244d39]"
            >
              Login
            </button>
          ) : (
            <>
              <div className="flex items-center gap-3 rounded-xl border border-stone-300 bg-[#F4F0E8] px-3 py-2 text-sm text-stone-700">
                <span>{user.name || "User"}</span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
              >
                Logout
              </button>
            </>
          )}

          {user && (
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-200/60 hover:text-stone-800"
            >
              <FiBell className="h-[19px] w-[19px]" />
              <span className="absolute right-[5px] top-[4px] h-2 w-2 rounded-full bg-[#C47D32]" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}