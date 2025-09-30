// src/Pages/AdminDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import AdminSidebar from "../Components/AdminSidebar";
import axiosInstance from "../Assests/api/axiosInstance";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  // ---- fetch real data ----
  const fetchAll = async () => {
    try {
      setLoading(true);
      setError("");
      const [{ data: moviesRes }, { data: usersRes }] = await Promise.all([
        axiosInstance.get("/movies"), // -> { items: [...] }
        axiosInstance.get("/users/admin/users", { params: { limit: 200 } }), // -> [...]
      ]);

      setMovies(Array.isArray(moviesRes?.items) ? moviesRes.items : []);
      setUsers(Array.isArray(usersRes) ? usersRes : []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load dashboard");
      setMovies([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ---- helpers ----
  const toDate = (v) => (v ? new Date(v) : null);
  const fmt = (d) =>
    d ? `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "—";
  const initials = (f = "", l = "") =>
    (f?.[0] || l?.[0] || "U").toUpperCase();

  // ---- stats from real data ----
  const totalMovies = movies.length;
  const totalUsers = users.length;
  const webSeriesCount = movies.filter((m) => m.type === "web-series").length;

  // new users today / week
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

  const newUsersToday = users.filter((u) => toDate(u.createdAt) >= startOfToday).length;
  const newUsersThisWeek = users.filter((u) => toDate(u.createdAt) >= sevenDaysAgo).length;

  // ---- chart: sign-ups last 7 days (real) ----
  const signups7 = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = d.toDateString();
      const count = users.reduce((acc, u) => {
        const ud = toDate(u.createdAt);
        return ud && ud.toDateString() === key ? acc + 1 : acc;
      }, 0);
      days.push({ day: d.toLocaleDateString(undefined, { weekday: "short" }), count });
    }
    return days;
  }, [users]);

  // ---- recent lists ----
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map((u) => ({
      id: u._id,
      name: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email?.split("@")[0] || "—",
      email: u.email,
      at: toDate(u.createdAt),
      avatar: initials(u.firstName, u.lastName),
    }));

  const recentMovies = [...movies]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5)
    .map((m) => ({
      id: m._id,
      title: m.name,
      genre: (m.genre || "").toString(),
      status: m.status || "Active",
      at: toDate(m.createdAt),
    }));

  // ---- tiny UI bits ----
  const StatCard = ({ title, value, hint, color, icon }) => (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>{icon}</div>
        {hint ? (
          <div className="px-3 py-1 rounded-full text-sm font-medium bg-blue-600/20 text-blue-300">
            {hint}
          </div>
        ) : (
          <span />
        )}
      </div>
      <h3 className="text-gray-400 text-sm font-semibold mb-1">{title}</h3>
      <p className="text-3xl font-black text-white">{loading ? "—" : value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex">
      <AdminSidebar showMobileToggle />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black">Admin Dashboard</h1>
              <p className="text-gray-400 mt-1">Live overview from your database</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchAll}
                disabled={loading}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 rounded-lg font-semibold"
              >
                {loading ? "Refreshing…" : "Refresh"}
              </button>
            </div>
          </div>
          {error && (
            <div className="mt-3 text-sm text-red-400 bg-red-600/10 border border-red-600/30 rounded-lg px-3 py-2 inline-block">
              {error}
            </div>
          )}
        </div>

        {/* Main */}
        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Movies"
              value={totalMovies.toLocaleString()}
              hint={`+${Math.max(0, totalMovies)} total`}
              color="bg-red-600/20"
              icon={
                <svg className="w-6 h-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 5h8m-9 3h10M7 8v11a2 2 0 002 2h6a2 2 0 002-2V8" />
                </svg>
              }
            />
            <StatCard
              title="Total Users"
              value={totalUsers.toLocaleString()}
              hint={`+${newUsersThisWeek} this week`}
              color="bg-blue-600/20"
              icon={
                <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9a7 7 0 0114 0v1H5v-1z" />
                </svg>
              }
            />
            <StatCard
              title="New Users Today"
              value={newUsersToday.toLocaleString()}
              hint="today"
              color="bg-green-600/20"
              icon={
                <svg className="w-6 h-6 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              }
            />
            <StatCard
              title="Web Series"
              value={webSeriesCount.toLocaleString()}
              hint="of total"
              color="bg-purple-600/20"
              icon={
                <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              }
            />
          </div>

          {/* Signups chart (last 7 days) */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold mb-1">User Sign-ups (7 days)</h2>
                <p className="text-gray-400">Real-time from createdAt</p>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={signups7}>
                  <defs>
                    <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#F9FAFB",
                    }}
                    formatter={(v) => [`${v} sign-ups`, "Users"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#dc2626"
                    fillOpacity={1}
                    fill="url(#colorSignups)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent users */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Recent User Registrations</h2>
              </div>
              <div className="space-y-4">
                {recentUsers.length === 0 ? (
                  <p className="text-gray-400">No users yet.</p>
                ) : (
                  recentUsers.map((u) => (
                    <div key={u.id} className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg">
                      <div className="w-10 h-10 bg-red-600 rounded-full grid place-items-center font-semibold text-sm">
                        {u.avatar}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{u.name}</h4>
                        <p className="text-sm text-gray-400">{u.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">{fmt(u.at)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent movies */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Recent Movie Uploads</h2>
              </div>
              <div className="space-y-4">
                {recentMovies.length === 0 ? (
                  <p className="text-gray-400">No content yet.</p>
                ) : (
                  recentMovies.map((m) => (
                    <div key={m.id} className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg grid place-items-center">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5h8m-9 3h10M7 8v11a2 2 0 002 2h6a2 2 0 002-2V8" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{m.title}</h4>
                        <p className="text-sm text-gray-400">{m.genre}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">{fmt(m.at)}</p>
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-400">
                          {m.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
