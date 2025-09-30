import { useEffect, useRef, useState } from "react";
import { Heart, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../Assests/api/axiosInstance";
import { useAuth } from "../context/AuthContext";

/* ---------------- Reusable Card (same look as Category) ---------------- */
function FavCard({ item, onToggleFavorite, isFavorite, onOpenDetail }) {
  const poster =
    item?.mainPoster || item?.backgroundPoster || item?.mobilePoster || item?.posters?.main?.url || "";
  const title = item?.title || item?.name || "";
  const genre = (item?.genre || "movie").toUpperCase();

  const open = () => onOpenDetail(item);

  return (
    <div className="group/card w-40 sm:w-44 md:w-48 lg:w-52 xl:w-56 flex-shrink-0">
      <div
        role="button"
        tabIndex={0}
        onClick={open}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && open()}
        className="relative aspect-[2/3] overflow-hidden rounded-xl bg-zinc-900 shadow-2xl transition-all duration-500 group-hover/card:shadow-red-500/20 group-hover/card:scale-105 cursor-pointer"
      >
        {poster ? (
          <img
            src={poster}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-zinc-500 text-sm">No Image</div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover/card:opacity-80 transition-opacity duration-300" />

        {/* fav toggle (stop bubbling so it doesn't navigate) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item);
          }}
          className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
            isFavorite ? "bg-red-600 text-white" : "bg-black/40 text-white hover:bg-red-600 hover:text-white"
          }`}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
        </button>

        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              open();
            }}
            className="p-3 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors duration-200 shadow-lg"
            aria-label="Open movie"
            title="Open movie"
          >
            <Play className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="mt-3 px-1">
        <h3 className="text-white font-semibold leading-tight line-clamp-2 text-sm sm:text-base group-hover/card:text-red-400 transition-colors duration-200">
          {title}
        </h3>
        <p className="text-xs text-zinc-400 mt-1 font-medium">{genre}</p>
      </div>
    </div>
  );
}

/* ---------------- Horizontal slider wrapper ---------------- */
function Row({ title, items, onToggleFavorite, favSet, onOpenDetail }) {
  const ref = useRef(null);
  const [left, setLeft] = useState(false);
  const [right, setRight] = useState(false);

  const check = () => {
    if (!ref.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    setLeft(scrollLeft > 0);
    setRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  const scroll = (dir) => {
    if (!ref.current) return;
    const amount = 208 * 3;
    ref.current.scrollTo({
      left: dir === "left" ? ref.current.scrollLeft - amount : ref.current.scrollLeft + amount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    check();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", check);
    window.addEventListener("resize", check);
    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [items]);

  if (!items?.length) return null;

  return (
    <section className="mb-10">
      <div className="flex items-end justify-between mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white relative">
          {title}
          <div className="absolute -bottom-1 left-0 w-12 h-1 bg-gradient-to-r from-red-600 to-red-400 rounded-full" />
        </h2>

        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!left}
            className={`w-10 h-10 rounded-full border transition-all duration-200 flex items-center justify-center ${
              left
                ? "bg-red-600/20 border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                : "bg-zinc-800/50 border-zinc-700 text-zinc-600 cursor-not-allowed"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!right}
            className={`w-10 h-10 rounded-full border transition-all duration-200 flex items-center justify-center ${
              right
                ? "bg-red-600/20 border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                : "bg-zinc-800/50 border-zinc-700 text-zinc-600 cursor-not-allowed"
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div ref={ref} className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-none">
        {items.map((m) => (
          <FavCard
            key={m._id}
            item={m}
            onToggleFavorite={onToggleFavorite}
            isFavorite={favSet.has(String(m._id))}
            onOpenDetail={onOpenDetail}
          />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------- Page ------------------------------- */
export default function FavoritesPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [items, setItems] = useState([]);
  const [favSet, setFavSet] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const openDetail = (movie) => {
    if (!movie?._id) return;
    navigate(`/movie/${movie._id}`);
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      setErr("");
      // GET /favorites -> returns cards already mapped by your backend
      const res = await axiosInstance.get("/favorites");
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setItems(data);
      setFavSet(new Set(data.map((d) => String(d._id))));
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const toggleFavorite = async (movie) => {
    const id = String(movie._id);
    const was = favSet.has(id);

    // optimistic UI
    setFavSet((prev) => {
      const n = new Set(prev);
      was ? n.delete(id) : n.add(id);
      return n;
    });
    setItems((prev) => (was ? prev.filter((m) => String(m._id) !== id) : prev));

    try {
      if (was) {
        await axiosInstance.delete(`/favorites/${id}`);
      } else {
        await axiosInstance.post(`/favorites/${id}`);
      }
    } catch {
      // revert on error
      await fetchAll();
    }
  };

  return (
    <main className="w-full min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black">
      <style>{`
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>

      <div className="px-3 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 lg:py-12">
        <header className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-2">
            Your <span className="text-red-600">Favorites</span>
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base lg:text-lg">
            All the movies and series you’ve saved.
          </p>
        </header>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-xl bg-zinc-900 animate-pulse" />
            ))}
          </div>
        ) : err ? (
          <div className="text-red-400 bg-red-950/20 border border-red-800/30 rounded-lg p-4">
            {err}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-zinc-300 bg-zinc-900/40 border border-zinc-800 rounded-xl p-10">
            <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
            <p className="mb-6">Browse movies and tap the heart to save them here.</p>
            <button
              onClick={() => navigate("/homepage")}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-white"
            >
              Explore Movies
            </button>
          </div>
        ) : (
          <Row
            title="Saved by you"
            items={items}
            favSet={favSet}
            onToggleFavorite={toggleFavorite}
            onOpenDetail={openDetail}
          />
        )}
      </div>
    </main>
  );
}
