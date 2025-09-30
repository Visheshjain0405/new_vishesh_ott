// src/Pages/CategoryPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../Assests/api/axiosInstance";
import Navbar from "../Components/Navbar";
import { Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const TYPE_LABELS = {
  "bollywood-movies": "Bollywood Movies",
  "south-hindi-dubbed": "South Hindi Dubbed",
  "hollywood-movies": "Hollywood Movies",
  "web-series": "Web Series",
};

const PAGE_SIZE = 12;

function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;

  const windowSize = 2;
  const nums = [];
  for (let p = 1; p <= pages; p++) {
    const edge = p === 1 || p === pages;
    const near = Math.abs(p - page) <= windowSize;
    if (edge || near) nums.push(p);
  }
  const dedup = [...new Set(nums)].sort((a, b) => a - b);
  const withDots = [];
  for (let i = 0; i < dedup.length; i++) {
    withDots.push(dedup[i]);
    if (i < dedup.length - 1 && dedup[i + 1] !== dedup[i] + 1) withDots.push("…");
  }

  return (
    <div className="flex items-center gap-2">
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
              v === page
                ? "bg-red-600 text-white"
                : "bg-black/60 text-zinc-200 hover:bg-red-600/20 border border-red-700/40"
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

function MovieCard({ item, onClick, onToggleFavorite, isFavorite }) {
  const poster =
    item?.posters?.main?.url ||
    item?.posters?.background?.url ||
    item?.posters?.mobile?.url ||
    "";

  return (
    <div className="group bg-zinc-900/50 rounded-2xl overflow-hidden border border-zinc-800 hover:border-red-600/40 transition-colors">
      <div className="relative aspect-[2/3] cursor-pointer" onClick={onClick}>
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

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(item);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full border border-white/10 text-white transition
            ${isFavorite ? "bg-red-600" : "bg-black/60 hover:bg-red-600/80"}`}
          aria-label="Toggle favorite"
          title={isFavorite ? "Remove favorite" : "Add favorite"}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
        </button>
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

export default function CategoryPage() {
  const { type } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const title = TYPE_LABELS[type] || "Movies";
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ items: [], total: 0, loading: true, error: "" });

  // favorites
  const [favorites, setFavorites] = useState(new Set());
  const [loadingFavs, setLoadingFavs] = useState(true);

  const limit = PAGE_SIZE;
  const pages = useMemo(() => Math.max(1, Math.ceil(state.total / limit)), [state.total, limit]);

  // Fetch category page
  useEffect(() => {
    let mounted = true;
    (async () => {
      setState((s) => ({ ...s, loading: true, error: "" }));
      try {
        const res = await axiosInstance.get("/movies", {
          params: { type, page, limit, sort: "-createdAt" },
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
    return () => { mounted = false; };
  }, [type, page]);

  // Reset to page 1 when type changes
  useEffect(() => { setPage(1); }, [type]);

  // Load favorite IDs (only when authenticated)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!isAuthenticated) {
          setFavorites(new Set());
          return;
        }
        const res = await axiosInstance.get("/favorites/ids");
        if (!mounted) return;
        setFavorites(new Set((res.data?.data || []).map(String)));
      } catch {
        // ignore 401 etc; interceptor can handle if you added one
      } finally {
        if (mounted) setLoadingFavs(false);
      }
    })();
    return () => { mounted = false; };
  }, [isAuthenticated]);

  const handleOpenMovie = (m) => navigate(`/movie/${m._id}`);

  // Optimistic favorite toggle
  const handleToggleFavorite = async (movie) => {
    const id = String(movie._id);

    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    const wasFav = favorites.has(id);
    setFavorites((prev) => {
      const next = new Set(prev);
      wasFav ? next.delete(id) : next.add(id);
      return next;
    });

    try {
      if (wasFav) {
        await axiosInstance.delete(`/favorites/${id}`);
      } else {
        await axiosInstance.post(`/favorites/${id}`);
      }
    } catch {
      // revert on error
      setFavorites((prev) => {
        const next = new Set(prev);
        wasFav ? next.add(id) : next.delete(id);
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-end justify-between mb-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">{title}</h1>
          <span className="text-sm text-zinc-400">
            {state.total} {state.total === 1 ? "result" : "results"}
          </span>
        </div>

        {state.loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {Array.from({ length: limit }).map((_, i) => (
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
          <div className="p-6 rounded-xl border border-red-800/40 bg-red-950/20 text-red-400">
            {state.error}
          </div>
        ) : state.items.length ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {state.items.map((m) => (
                <MovieCard
                  key={m._id}
                  item={m}
                  onClick={() => handleOpenMovie(m)}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={favorites.has(String(m._id))}
                />
              ))}
            </div>

            {/* right-aligned pagination */}
            <div className="mt-10 flex justify-end">
              <Pagination page={page} pages={pages} onChange={setPage} />
            </div>
          </>
        ) : (
          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/40 text-zinc-300">
            No movies found.
          </div>
        )}
      </main>
    </div>
  );
}
