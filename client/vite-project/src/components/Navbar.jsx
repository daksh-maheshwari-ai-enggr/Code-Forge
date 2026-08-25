import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiBookOpen,
  FiGrid,
  FiCompass,
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
    { name: "Home", path: "/", icon: FiGrid },
    { name: "Browse", path: "/browse", icon: FiCompass },
  ];

  if (user?.role === "AUTHOR") {
    navItems.push(
      { name: "Write", path: "/author/write", icon: FiEdit3 }, // ✅ FIXED PATH
      { name: "Profile", path: "/profile", icon: FiUser }
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
          <span className="font-serif font-bold text-xl tracking-tight text-[#1B3B2B]">
            Lumen
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-[#ECE7DC]/70 p-1 rounded-full border border-stone-200/60">
          {navItems.map((item) => {
            const Icon = item.icon;

            // ✅ BETTER ACTIVE CHECK (handles nested routes)
            const isActive = currentPath.startsWith(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#1B3B2B] text-white shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="flex items-center gap-3">

          <button
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-50 shadow-sm"
          >
            {/* ✅ Dynamic user name + role */}
            <span>
              {user?.name || "User"} ({user?.role?.toLowerCase()})
            </span>
            <FiChevronDown className="w-3.5 h-3.5 text-stone-400" />
          </button>

          <button
            type="button"
            aria-label="Notifications"
            className="relative p-2 rounded-full hover:bg-stone-200/50 text-stone-600 transition-colors"
          >
            <FiBell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-[#FBF9F5]" />
          </button>

          {/* ✅ Dynamic initials */}
          <div className="w-8 h-8 rounded-full bg-[#1B3B2B] text-[#D8E6DC] flex items-center justify-center text-xs font-semibold">
            {user?.name
              ? user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
              : "U"}
          </div>
        </div>

      </div>
    </header>
  );
}