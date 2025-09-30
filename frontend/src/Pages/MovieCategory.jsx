// src/Pages/MovieCategory.jsx
import { useEffect, useRef, useState } from "react";
import { Heart, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../Assests/api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const TYPE_LABELS = {
  "bollywood-movies": "Bollywood Movies",
  "south-hindi-dubbed": "South Hindi Dubbed",
  "hollywood-movies": "Hollywood Movies",
  "web-series": "Web Series",
};

/* --------------------------- MovieCard --------------------------- */
function MovieCard({ item, onToggleFavorite, isFavorite, onOpenDetail }) {
  const poster = item?.mainPoster || item?.backgroundPoster || item?.mobilePoster || "";
  const title = item?.title || "";
  const genre = (item?.genre || "movie").toUpperCase();

  // Defensive: only call if provided
  const handleOpen = () => onOpenDetail?.(item);

  return (
    <div className="group/card w-40 sm:w-44 md:w-48 lg:w-52 xl:w-56 flex-shrink-0">
      <div
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleOpen()}
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
              handleOpen();
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

/* --------------------------- CategoryRow --------------------------- */
function CategoryRow({ title, items, loading, error, onToggleFavorite, favorites, onOpenDetail }) {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScrollButtons = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
  };

  const scroll = (dir) => {
    if (!scrollContainerRef.current) return;
    const cardWidth = 208;
    const amount = cardWidth * 3;
    scrollContainerRef.current.scrollTo({
      left: dir === "left" ? scrollContainerRef.current.scrollLeft - amount : scrollContainerRef.current.scrollLeft + amount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    checkScrollButtons();
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScrollButtons);
    window.addEventListener("resize", checkScrollButtons);
    return () => {
      el.removeEventListener("scroll", checkScrollButtons);
      window.removeEventListener("resize", checkScrollButtons);
    };
  }, [items]);

  return (
    <section className="mb-8 sm:mb-12">
      <div className="flex items-end justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white relative">
          {title}
          <div className="absolute -bottom-1 left-0 w-12 h-1 bg-gradient-to-r from-red-600 to-red-400 rounded-full" />
        </h2>

        {!loading && !error && items?.length > 0 && (
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!showLeftArrow}
              className={`w-10 h-10 rounded-full border transition-all duration-200 flex items-center justify-center ${
                showLeftArrow
                  ? "bg-red-600/20 border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                  : "bg-zinc-800/50 border-zinc-700 text-zinc-600 cursor-not-allowed"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!showRightArrow}
              className={`w-10 h-10 rounded-full border transition-all duration-200 flex items-center justify-center ${
                showRightArrow
                  ? "bg-red-600/20 border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                  : "bg-zinc-800/50 border-zinc-700 text-zinc-600 cursor-not-allowed"
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex gap-3 sm:gap-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0">
              <div className="w-40 sm:w-44 md:w-48 lg:w-52 xl:w-56 aspect-[2/3] rounded-xl bg-zinc-900 animate-pulse" />
              <div className="mt-3 space-y-2">
                <div className="h-4 bg-zinc-800 rounded animate-pulse" />
                <div className="h-3 bg-zinc-800 rounded w-2/3 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-400 bg-red-950/20 border border-red-800/30 rounded-lg p-4">Failed to load: {error}</div>
      ) : items?.length ? (
        <div className="relative group/row">
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black/80 border border-red-600/50 text-red-400 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-red-600 hover:text-white transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black/80 border border-red-600/50 text-red-400 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-red-600 hover:text-white transition-all duration-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <div ref={scrollContainerRef} className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-none" onScroll={checkScrollButtons}>
            {items.map((m, idx) => (
              <MovieCard
                key={m._id || `${m.title}-${idx}`}
                item={m}
                onToggleFavorite={onToggleFavorite}
                isFavorite={favorites.has(String(m._id))}
                onOpenDetail={onOpenDetail}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-zinc-400 text-center py-8 bg-zinc-900/30 rounded-lg border border-zinc-800">No items available</div>
      )}
    </section>
  );
}

/* --------------------------- Page --------------------------- */
export default function MovieCategory() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [state, setState] = useState({
    "bollywood-movies": { data: [], loading: true, error: "" },
    "south-hindi-dubbed": { data: [], loading: true, error: "" },
    "hollywood-movies": { data: [], loading: true, error: "" },
    "web-series": { data: [], loading: true, error: "" },
  });

  const [favorites, setFavorites] = useState(new Set());
  const [loadingFavs, setLoadingFavs] = useState(true);
  const [favoritesData, setFavoritesData] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!isAuthenticated) return;
        const res = await axiosInstance.get("/favorites");
        if (!mounted) return;
        const arr = Array.isArray(res.data?.data) ? res.data.data : [];
        setFavoritesData(arr);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const handleOpenDetail = (movie) => {
    if (!movie?._id) return;
    navigate(`/movie/${movie._id}`);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axiosInstance.get("/movies/categories", {
          params: { bLimit: 10, sLimit: 10, hLimit: 10, wLimit: 10 },
        });
        if (!mounted) return;
        const d = res.data?.data || {};
        setState({
          "bollywood-movies": { data: d.bollywood || [], loading: false, error: "" },
          "south-hindi-dubbed": { data: d.southHindiDubbed || [], loading: false, error: "" },
          "hollywood-movies": { data: d.hollywood || [], loading: false, error: "" },
          "web-series": { data: d.webSeries || [], loading: false, error: "" },
        });
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || "Something went wrong";
        setState({
          "bollywood-movies": { data: [], loading: false, error: msg },
          "south-hindi-dubbed": { data: [], loading: false, error: msg },
          "hollywood-movies": { data: [], loading: false, error: msg },
          "web-series": { data: [], loading: false, error: msg },
        });
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!isAuthenticated) return;
        const res = await axiosInstance.get("/favorites/ids");
        if (!mounted) return;
        setFavorites(new Set((res.data?.data || []).map(String)));
      } catch {
      } finally {
        if (mounted) setLoadingFavs(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

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
      setFavorites((prev) => {
        const next = new Set(prev);
        wasFav ? next.add(id) : next.delete(id);
        return next;
      });
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
            Movie <span className="text-red-600">Collection</span>
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base lg:text-lg">Discover amazing movies and series</p>
          {!loadingFavs && isAuthenticated && (
            <div className="mt-4 flex items-center gap-2 text-red-400">
              <Heart className="w-5 h-5 fill-current" />
              <span className="text-sm sm:text-base">
                {favorites.size} favorite{favorites.size !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </header>

        {isAuthenticated && favoritesData.length > 0 && (
          <CategoryRow
            title="Your Favorites"
            items={favoritesData}
            loading={false}
            error=""
            onToggleFavorite={handleToggleFavorite}
            favorites={favorites}
            onOpenDetail={handleOpenDetail}
          />
        )}

        {Object.keys(TYPE_LABELS).map((type) => (
          <CategoryRow
            key={type}
            title={TYPE_LABELS[type]}
            items={state[type].data}
            loading={state[type].loading}
            error={state[type].error}
            onToggleFavorite={handleToggleFavorite}
            favorites={favorites}
            onOpenDetail={handleOpenDetail}
          />
        ))}
      </div>
    </main>
  );
}
