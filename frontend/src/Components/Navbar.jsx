// src/Components/Navbar.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const userMenuRef = useRef(null);
  const burgerRef = useRef(null);
  const mobilePanelId = "mobile-nav-panel";

  const NAV = useMemo(
    () => [
      { label: "Home", to: "/homepage" },
      { label: "Bollywood Movies", to: "/category/bollywood-movies" },
      { label: "South Hindi Dubbed", to: "/category/south-hindi-dubbed" },
      { label: "Hollywood Movies", to: "/category/hollywood-movies" },
      { label: "Web Series", to: "/category/web-series" },
      { label: "Favorites", to: "/favorites" },
    ],
    []
  );

  // Close dropdown on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname, location.search]);

  // Close menus on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setUserMenuOpen(false);
        burgerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Prevent background scroll when mobile menu open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

const onSubmitSearch = (e) => {
  e.preventDefault();
  const q = query.trim();
  if (!q) return;
  navigate(`/search?q=${encodeURIComponent(q)}&page=1`);
  setOpen(false);
};

  const activeClass = "text-red-400 bg-red-600/10 hover:bg-red-600/20";
  const baseClass = "text-gray-300 hover:text-white hover:bg-gray-800/50";

  const userInitial =
    (user?.firstName?.[0] || user?.email?.[0] || "U").toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-red-900/30">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top row */}
        <div className="flex items-center justify-between h-16">
          {/* Left: burger + brand */}
          <div className="flex items-center gap-4">
            <button
              ref={burgerRef}
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-gray-300 hover:text-white hover:bg-red-600/20 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black md:hidden transition-colors"
              aria-label="Toggle navigation menu"
              aria-controls={mobilePanelId}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
                </svg>
              )}
            </button>

            {/* Logo */}
            <NavLink to="/homepage" className="flex items-center gap-3 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white grid place-items-center font-black text-lg shadow-lg group-hover:shadow-red-500/25 transition-shadow">
                V
              </div>
              <span className="text-xl font-black tracking-tight text-white hidden sm:block">
                Cinema <span className="text-red-500 font-extrabold">OTT</span>
              </span>
            </NavLink>
          </div>

          {/* Desktop search */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form className="w-full" onSubmit={onSubmitSearch} role="search">
              <div className="relative">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search movies, shows..."
                  className="w-full rounded-xl border border-gray-700 bg-gray-900/50 py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 backdrop-blur-sm transition-colors"
                  aria-label="Search movies and shows"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </form>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-3">
            {/* Mobile search shortcut (opens mobile panel) */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-gray-300 hover:text-white hover:bg-red-600/20 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black transition-colors"
              aria-label="Open search"
              onClick={() => setOpen(true)}
            >
              <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden ring-2 ring-gray-700 hover:ring-red-500 focus:outline-none focus:ring-red-500 transition-all shadow-lg"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  onClick={() => setUserMenuOpen((s) => !s)}
                  title={user?.firstName || user?.email || "Profile"}
                >
                  <span className="h-full w-full grid place-items-center text-sm font-bold text-white">
                    {userInitial}
                  </span>
                </button>

                {userMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-800 bg-black/95 backdrop-blur-xl shadow-2xl p-2 z-50"
                  >
                    <div className="px-3 py-2">
                      <p className="text-xs text-zinc-400">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">
                        {user?.firstName ? `${user.firstName} ${user?.lastName || ""}` : user?.email}
                      </p>
                    </div>
                    <hr className="border-zinc-800 my-2" />
                    <NavLink
                      to="/favorites"
                      className="block w-full text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-zinc-800/50"
                      onClick={() => setUserMenuOpen(false)}
                      role="menuitem"
                    >
                      Favorites
                    </NavLink>
                    <button
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:text-white hover:bg-red-600/20"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      role="menuitem"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <NavLink
                  to="/auth"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50"
                >
                  Sign in
                </NavLink>
                <NavLink
                  to="/auth"
                  className="px-3 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 text-white"
                >
                  Create account
                </NavLink>
              </div>
            )}
          </div>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1 pb-4">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive ? activeClass : baseClass
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Mobile dropdown panel */}
        <div
          id={mobilePanelId}
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            open ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="border-t border-gray-800 pt-4 space-y-4">
            {/* Mobile search */}
            <div className="px-1">
              <form onSubmit={onSubmitSearch} className="relative" role="search">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search movies, shows..."
                  className="w-full rounded-xl border border-gray-700 bg-gray-900/50 py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 backdrop-blur-sm transition-colors"
                  aria-label="Search movies and shows"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </form>
            </div>

            {/* Mobile navigation links */}
            <div className="grid gap-1">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActive ? activeClass : baseClass
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            {/* Mobile auth actions */}
            {!isAuthenticated ? (
              <div className="grid gap-2 px-1">
                <NavLink
                  to="/auth"
                  className="px-4 py-3 rounded-lg font-medium text-gray-300 hover:text-white hover:bg-gray-800/50"
                >
                  Sign in
                </NavLink>
                <NavLink
                  to="/auth"
                  className="px-4 py-3 rounded-lg font-semibold bg-red-600 hover:bg-red-700 text-white text-center"
                >
                  Create account
                </NavLink>
              </div>
            ) : (
              <div className="grid gap-2 px-1">
                <NavLink
                  to="/favorites"
                  className="px-4 py-3 rounded-lg font-medium text-gray-300 hover:text-white hover:bg-gray-800/50"
                >
                  Favorites
                </NavLink>
                <button
                  className="px-4 py-3 rounded-lg font-semibold text-red-400 hover:text-white hover:bg-red-600/20 text-left"
                  onClick={logout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
