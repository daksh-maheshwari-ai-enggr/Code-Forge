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
  const isAuthorView =
    user?.role === "AUTHOR" || user?.role == null;

  if (isAuthorView) {
    navItems.push(
      {
        name: "Write",
        path: "/write",
        icon: FiEdit3,
      },
      {
        name: "Profile",
        path: "/profile",
        icon: FiUser,
      },
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
    <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-[#FBF8F3]">
      <div className="mx-auto flex h-[69px] max-w-[1460px] items-center justify-between px-8">
        {/* Logo */}
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2.5"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B3B2B] text-white">
            <FiBookOpen className="h-4 w-4" />
          </div>

          <span className="font-serif text-xl font-bold tracking-tight text-[#1B3B2B]">
            Lumen
          </span>
        </Link>

        {/* Navigation */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);

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

        {/* Right Side */}
        <div className="flex shrink-0 items-center gap-4">
          {/* Author Selector */}
          <button
            type="button"
            className="flex h-10 items-center gap-3 rounded-xl border border-stone-300 bg-[#F4F0E8] px-4 text-sm text-stone-700 transition hover:bg-[#ECE7DD]"
          >
            <span className="font-mono">
              Priya Mehta (author)
            </span>

            <FiChevronDown className="h-4 w-4 text-stone-600" />
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

          {/* Avatar */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1B3B2B] text-xs font-semibold text-[#D8E6DC]">
            PM
          </div>
        </div>
      </div>
    </header>
  );
}