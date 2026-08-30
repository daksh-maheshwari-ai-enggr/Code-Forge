import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiBookOpen,
  FiGrid,
  FiSearch,
  FiEdit3,
  FiUser,
  FiBell,
  FiChevronDown,
} from "react-icons/fi";

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
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

  // Show author navigation for the current Figma/author UI.
  // Keep the existing role-based behavior for admin.
  const isAuthorView = user?.role === "AUTHOR";

  if (isAuthorView) {
    navItems.push(
      { name: "Write", path: "author/write", icon: FiEdit3 },
      { name: "Profile", path: "/profile", icon: FiUser },
    );
  }

  if (user?.role === "ADMIN") {
    navItems.push({
      name: "Admin",
      path: "/admin/dashboard",
      icon: FiGrid,
    });
  }

  return (
    <header className="w-full bg-[#FBF9F5] border-b border-stone-200/80 px-6 py-3.5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1B3B2B] flex items-center justify-center text-white">
            <FiBookOpen className="w-4 h-4" />
          </div>

          <span className="font-serif text-xl font-bold tracking-tight text-[#1B3B2B]">
            Lumen
          </span>
        </Link>

        {/* Navigation Switcher */}
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

        {/* User Profile & Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-10 items-center gap-3 rounded-xl border border-stone-300 bg-[#F4F0E8] px-4 text-sm text-stone-700 transition hover:bg-[#ECE7DD]"
          >
            <span>Priya Mehta (author)</span>
            <FiChevronDown className="w-3.5 h-3.5 text-stone-400" />
          </button>

          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-200/60 hover:text-stone-800"
          >
            <FiBell className="h-[19px] w-[19px]" />

            <span className="absolute right-[5px] top-[4px] h-2 w-2 rounded-full bg-[#C47D32]" />
          </button>

          <div className="w-8 h-8 rounded-full bg-[#1B3B2B] text-[#D8E6DC] flex items-center justify-center text-xs font-semibold">
            PM
          </div>
        </div>

      </div>
    </header>
  );
}