// src/Pages/SearchPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../Assests/api/axiosInstance";
import Navbar from "../Components/Navbar";

const PAGE_SIZE = 12;

function MovieCard({ item, onOpen }) {
  const poster =
    item?.posters?.main?.url ||
    item?.posters?.background?.url ||
    item?.posters?.mobile?.url ||
    "";

  return (
    <div
      onClick={() => onOpen(item)}
      className="group cursor-pointer bg-zinc-900/50 rounded-2xl overflow-hidden border border-zinc-800 hover:border-red-600/40 transition-colors"
    >
      <div className="relative aspect-[2/3]">
        {poster ? (
          <img
            src={poster}
            alt={item?.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-zinc-500">No Image</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-white font-semibold truncate">{item?.name}</h3>
        <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wide">
          {item?.genre || "Movie"}
        </p>
      </div>
    </div>
  );
}

function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const windowSize = 2;
  const nums = [];
  for (let p = 1; p <= pages; p++) {
    const isEdge = p === 1 || p === pages;
    const isNear = Math.abs(p - page) <= windowSize;
    if (isEdge || isNear) nums.push(p);
  }
  const dedup = [...new Set(nums)].sort((a, b) => a - b);
  const withDots = [];
  for (let i = 0; i < dedup.length; i++) {
    withDots.push(dedup[i]);
    if (i < dedup.length - 1 && dedup[i + 1] !== dedup[i] + 1) withDots.push("…");
  }
  return (
    <div className="mt-10 flex items-center justify-end gap-2">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-4 py-2 rounded-lg border border-red-700/40 bg-black/60 text-zinc-200 hover:bg-red-600/20 disabled:opacity-50"
      >
        Prev
      </button>
      {withDots.map((v, i) =>
        v === "…" ? (
          <span key={`dots-${i}`} className="px-2 text-zinc-500">…</span>
        ) : (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`min-w-[40px] px-3 py-2 rounded-lg ${
              v === page ? "bg-red-600 text-white" : "bg-black/60 text-zinc-200 hover:bg-red-600/20 border border-red-700/40"
            }`}
          >
            {v}
          </button>
        )
      )}
      <button
        onClick={() => onChange(Math.min(pages, page + 1))}
        disabled={page === pages}
        className="px-4 py-2 rounded-lg border border-red-700/40 bg-black/60 text-zinc-200 hover:bg-red-600/20 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}

export default function SearchPage() {
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();

  const q = (sp.get("q") || "").trim();
  const pageFromUrl = Math.max(1, Number(sp.get("page") || 1));
  const [state, setState] = useState({ items: [], total: 0, loading: true, error: "" });
  const pages = useMemo(
    () => Math.max(1, Math.ceil(state.total / PAGE_SIZE)),
    [state.total]
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      setState((s) => ({ ...s, loading: true, error: "" }));
      try {
        const res = await axiosInstance.get("/movies", {
          params: { q, page: pageFromUrl, limit: PAGE_SIZE, sort: "-createdAt" },
        });
        const items = res.data?.items || res.data?.data || [];
        const total = res.data?.total ?? res.data?.meta?.total ?? 0;
        if (!mounted) return;
        setState({ items, total, loading: false, error: "" });
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || "Something went wrong";
        if (!mounted) return;
        setState({ items: [], total: 0, loading: false, error: msg });
      }
    })();
    return () => {
      mounted = false;
    };
  }, [q, pageFromUrl]);

  const handleOpenMovie = (m) => navigate(`/movie/${m._id}`);

  const updatePage = (p) => {
    const next = new URLSearchParams(sp);
    next.set("page", String(p));
    setSp(next, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-end justify-between mb-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
            Results for <span className="text-red-500">“{q || "…" }”</span>
          </h1>
          <span className="text-sm text-zinc-400">
            {state.total} {state.total === 1 ? "result" : "results"}
          </span>
        </div>

        {state.loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-900/40">
                <div className="aspect-[2/3] animate-pulse bg-zinc-800/60" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-zinc-800 rounded animate-pulse" />
                  <div className="h-3 w-2/3 bg-zinc-800 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : state.error ? (
          <div className="p-6 rounded-xl border border-red-800/40 bg-red-950/20 text-red-400">{state.error}</div>
        ) : state.items.length ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {state.items.map((m) => (
                <MovieCard key={m._id} item={m} onOpen={handleOpenMovie} />
              ))}
            </div>
            <Pagination page={pageFromUrl} pages={pages} onChange={updatePage} />
          </>
        ) : (
          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/40 text-zinc-300">
            No results found.
          </div>
        )}
      </main>
    </div>
  );
}
