// src/Components/AdminSidebar.jsx
import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../Assests/api/axiosInstance";

export default function AdminSidebar({
  menuItems: menuItemsProp,
  user = { name: "Admin User", email: "admin@visheshott.com" },
  onLogout = () => alert("Logged out successfully!"),
  showMobileToggle = false,
  className = "",
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [counts, setCounts] = useState({ movies: 0, users: 0 });

  const location = useLocation();
  const navigate = useNavigate();

  // ---- fetch live counts ----
  const fetchCounts = async () => {
    try {
      setLoadingCounts(true);
      const [{ data: moviesRes }, { data: usersRes }] = await Promise.all([
        axiosInstance.get("/movies"), // -> { items: [...] }
        axiosInstance.get("/users/admin/users", { params: { limit: 1000 } }), // -> [ ... ]
      ]);
      const moviesCount = Array.isArray(moviesRes?.items) ? moviesRes.items.length : 0;
      const usersCount = Array.isArray(usersRes) ? usersRes.length : 0;
      setCounts({ movies: moviesCount, users: usersCount });
    } catch (e) {
      // Silent fail to keep sidebar usable
      setCounts((c) => c); // keep whatever we had
      console.error("Sidebar count fetch failed:", e);
    } finally {
      setLoadingCounts(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  // default menu with Dashboard + Movies + Users, using live counts
  const menuItems = useMemo(
    () =>
      menuItemsProp ?? [
        {
          id: "dashboard",
          label: "Dashboard",
          to: "/admin/dashboard",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0 7-7 7 7M5 10v10a2 2 0 002 2h3m10-12l2 2m-2-2v10a2 2 0 01-2 2h-3m-6 0h6"
              />
            </svg>
          ),
        },
        {
          id: "movies",
          label: "Movies",
          to: "/admin/movies",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0v14a2 2 0 002 2h6a2 2 0 002-2V4m-9 0h10M9 8h6m-6 4h6m-6 4h3"
              />
            </svg>
          ),
          count: counts.movies,
        },
        {
          id: "users",
          label: "Users",
          to: "/admin/users",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
          ),
          count: counts.users,
        },
      ],
    [menuItemsProp, counts.movies, counts.users]
  );

  const MobileToggle = () =>
    showMobileToggle ? (
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    ) : null;

  const handleLogout = () => {
    setShowLogoutModal(false);
    onLogout();
    navigate("/admin/login");
  };

  return (
    <>
      <MobileToggle />

      {/* Mobile Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${className}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white grid place-items-center font-black text-lg shadow-lg">
                V
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-black text-white">Cinema OTT</h1>
                <p className="text-gray-400 text-xs">Admin Dashboard</p>
              </div>

              {/* tiny refresh for counts */}
              <button
                onClick={fetchCounts}
                title="Refresh counts"
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                disabled={loadingCounts}
              >
                <svg className={`w-4 h-4 ${loadingCounts ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6M20 20v-6h-6M20 8a8 8 0 10-6.32 12.906" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive ? "bg-red-600/20 border border-red-600/30 text-red-400" : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`
                }
              >
                <span className="text-gray-500 group-[.active]:text-red-400 group-hover:text-gray-300">{item.icon}</span>
                <span className="font-semibold">{item.label}</span>
                {typeof item.count === "number" && (
                  <span
                    className={`ml-auto px-2 py-1 text-xs rounded-full font-bold ${
                      location.pathname.startsWith(item.to)
                        ? "bg-red-600/30 text-red-300"
                        : "bg-gray-700 text-gray-300 group-hover:bg-gray-600"
                    }`}
                  >
                    {loadingCounts ? "…" : item.count.toLocaleString()}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 text-white grid place-items-center font-bold text-sm">
                {user?.name?.[0] ?? "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
                <p className="text-gray-400 text-xs truncate">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-600/10 transition-all duration-200 group"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 max-w-md w-full">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-600/20 mb-4">
                <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Confirm Logout</h3>
              <p className="text-gray-400 mb-6">Are you sure you want to logout from admin dashboard?</p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
