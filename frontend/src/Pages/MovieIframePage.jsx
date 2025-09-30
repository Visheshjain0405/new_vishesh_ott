// src/Pages/MovieIframePage.jsx
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../Assests/api/axiosInstance";

export default function MovieIframePage() {
  const { movieId } = useParams();
  const [searchParams] = useSearchParams(); // optional episode index: ?e=0
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axiosInstance.get(`/movies/${movieId}`);
        if (!mounted) return;
        setMovie(res.data);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.response?.data?.message || e?.message || "Failed to load movie");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [movieId]);

  if (loading) {
    return (
      <div className="w-[100vw] h-[100vh] bg-black text-white grid place-items-center">
        Loading…
      </div>
    );
  }
  if (err || !movie) {
    return (
      <div className="w-[100vw] h-[100vh] bg-black text-white grid place-items-center p-6 text-center">
        <div>
          <p className="mb-4">{err || "Movie not found."}</p>
          <button
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // if you also support web-series episodes, pick by ?e=INDEX (0-based)
  const epIndexRaw = searchParams.get("e");
  const epIndex = Number.isFinite(Number(epIndexRaw)) ? Number(epIndexRaw) : null;

  const src =
    movie?.type === "web-series" &&
    Array.isArray(movie?.episodes) &&
    movie.episodes.length > 0
      ? (movie.episodes[Math.min(Math.max(epIndex ?? 0, 0), movie.episodes.length - 1)]?.link || "")
      : (movie?.movieLink || "");

  return (
    <div className="bg-black">
      {/* full-viewport player, exactly as you asked */}
      <iframe
        className="h-[100vh] w-[100vw]"
        src={src}
        title={movie?.name || "Movie"}
        allowFullScreen
      />
    </div>
  );
}
