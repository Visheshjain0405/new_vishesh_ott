// src/Pages/AdminUsersPage.jsx
import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../Components/AdminSidebar";
import axiosInstance from "../Assests/api/axiosInstance";

export default function AdminUsersPage() {
  // ------------ state ------------
  const [usersRaw, setUsersRaw] = useState([]);
  const [limit, setLimit] = useState(50);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt"); // createdAt | name | email
  const [sortDir, setSortDir] = useState("desc");    // asc | desc

  // ------------ fetch ------------
  const fetchUsers = async (currentLimit = limit) => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axiosInstance.get("/users/admin/users", {
        params: { limit: currentLimit },
        // headers: { "x-admin-key": import.meta.env.VITE_ADMIN_READONLY_KEY }, // if you added API key
      });
      setUsersRaw(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to fetch users");
      setUsersRaw([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  // ------------ rows ------------
  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = usersRaw.map((u) => ({
      id: u._id,
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      name:
        [u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||
        u.email?.split("@")[0] ||
        "—",
      email: u.email || "—",
      role: u.role || "user",
      createdAt: u.createdAt ? new Date(u.createdAt) : null,
    }));

    if (term) {
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(term) ||
          r.email.toLowerCase().includes(term)
      );
    }

    list.sort((a, b) => {
      let va, vb;
      switch (sortBy) {
        case "name":
          va = a.name.toLowerCase();
          vb = b.name.toLowerCase();
          break;
        case "email":
          va = a.email.toLowerCase();
          vb = b.email.toLowerCase();
          break;
        default: // createdAt
          va = a.createdAt ? a.createdAt.getTime() : 0;
          vb = b.createdAt ? b.createdAt.getTime() : 0;
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [usersRaw, search, sortBy, sortDir]);

  // total users only
  const totalUsers = usersRaw.length;

  const toggleSort = (key) => {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <AdminSidebar showMobileToggle />

      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black">Users</h1>
              <p className="text-gray-400 mt-1">All registered users</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                title="Rows"
              >
                {[10, 20, 50, 100, 200].map((n) => (
                  <option key={n} value={n}>Show {n}</option>
                ))}
              </select>
              <button
                onClick={() => fetchUsers()}
                disabled={loading}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 rounded-lg font-semibold"
              >
                {loading ? "Refreshing…" : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="p-6">
          {/* Single Stat Card: Total Users */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={totalUsers.toLocaleString()}
              color="bg-blue-600/20"
              icon={
                <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 14a4 4 0 10-8 0v2a2 2 0 01-2 2h12a2 2 0 01-2-2v-2zM12 7a4 4 0 110-8 4 4 0 010 8z"/>
                </svg>
              }
            />
          </div>

          {/* Controls (search only) */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 mb-6">
            <div className="p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="relative">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name or email…"
                  className="w-72 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                  </svg>
                </span>
              </div>

              <div className="flex gap-2">
                <SortButton
                  label="Sort by Name"
                  active={sortBy === "name"}
                  dir={sortBy === "name" ? sortDir : undefined}
                  onClick={() => toggleSort("name")}
                />
                <SortButton
                  label="Sort by Email"
                  active={sortBy === "email"}
                  dir={sortBy === "email" ? sortDir : undefined}
                  onClick={() => toggleSort("email")}
                />
                <SortButton
                  label="Sort by Created"
                  active={sortBy === "createdAt"}
                  dir={sortBy === "createdAt" ? sortDir : undefined}
                  onClick={() => toggleSort("createdAt")}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-gray-700 overflow-hidden bg-gray-800/40">
            <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
              <div className="text-gray-300">
                {loading
                  ? "Loading users…"
                  : error
                  ? "Error"
                  : `${rows.length.toLocaleString()} result${rows.length === 1 ? "" : "s"}`}
              </div>
              {error && <div className="text-red-400 text-sm">{error}</div>}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-black/40">
                  <tr className="text-left text-gray-400 text-xs uppercase tracking-wide">
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={`sk-${i}`}>
                        <td className="px-6 py-4"><div className="h-4 w-40 bg-gray-800 rounded animate-pulse" /></td>
                        <td className="px-6 py-4"><div className="h-4 w-64 bg-gray-800 rounded animate-pulse" /></td>
                        <td className="px-6 py-4"><div className="h-4 w-40 bg-gray-800 rounded animate-pulse" /></td>
                      </tr>
                    ))
                  ) : rows.length === 0 ? (
                    <tr>
                      <td className="px-6 py-10 text-gray-400" colSpan={3}>
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={r.id} className="hover:bg-white/5">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 grid place-items-center text-xs font-bold">
                              {(r.firstName || r.name || "U").slice(0, 1).toUpperCase()}
                            </div>
                            <div className="font-semibold">{r.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">{r.email}</td>
                        <td className="px-6 py-4">
                          {r.createdAt ? r.createdAt.toLocaleString() : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            Showing up to {limit} newest users. Use the dropdown in the header to change the limit.
          </p>
        </div>
      </div>
    </div>
  );
}

/* --------- small UI pieces --------- */

function StatCard({ title, value, color, icon }) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 ${color} rounded-lg grid place-items-center`}>{icon}</div>
      </div>
      <h3 className="text-gray-400 text-sm font-semibold mb-1">{title}</h3>
      <p className="text-3xl font-black text-white">{value}</p>
    </div>
  );
}

function SortButton({ label, active, dir, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${
        active
          ? "border-red-600/40 bg-red-600/10 text-red-300"
          : "border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800"
      }`}
      title={label}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active && (
          <svg
            className={`w-4 h-4 ${dir === "asc" ? "" : "rotate-180"}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </span>
    </button>
  );
}
