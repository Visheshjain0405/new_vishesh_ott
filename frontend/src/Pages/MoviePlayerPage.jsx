// src/Pages/MoviePlayerPage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Play, AlertTriangle } from "lucide-react";
import axiosInstance from "../Assests/api/axiosInstance";

// (optional) if you have a Navbar component, uncomment and render it
// import Navbar from "../Components/Navbar";

/**
 * Decide how to render a given source URL.
 * - 'video' -> play directly via <video> (mp4, webm, ogg)
 * - 'hls'   -> use hls.js with <video> (m3u8)
 * - 'iframe'-> embedded page (only if provider allows)
 */
function classifySource(src) {
  if (!src) return { mode: "none" };
  const u = src.split("?")[0].toLowerCase();

  if (u.endsWith(".mp4") || u.endsWith(".webm") || u.endsWith(".ogg")) {
    return { mode: "video", type: "file" };
  }
  if (u.endsWith(".m3u8")) {
    return { mode: "hls" };
  }
  return { mode: "iframe" };
}

// Some hosts block embeds (or DevTools). We handle them by opening in a new tab.
const BLOCKED_EMBED = /(short\.icu|dood|streamwish|vidcloud|ok\.ru|drive\.google|mega\.nz)/i;

export default function MoviePlayerPage() {
  const { movieId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playerError, setPlayerError] = useState("");

  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  // If you support episodes, you can pass ?e=0 (index)
  const epIndex = Number.isFinite(Number(searchParams.get("e")))
    ? Number(searchParams.get("e"))
    : null;

  // Resolve the actual playback src
  const playbackSrc = useMemo(() => {
    if (!movie) return "";
    if (movie.type === "web-series" && Array.isArray(movie.episodes) && movie.episodes.length) {
      const idx = Math.min(Math.max(epIndex ?? 0, 0), movie.episodes.length - 1);
      return movie.episodes[idx]?.link || "";
    }
    return movie.movieLink || "";
  }, [movie, epIndex]);

  const sourceInfo = useMemo(() => classifySource(playbackSrc), [playbackSrc]);
  const blocked = useMemo(() => BLOCKED_EMBED.test(playbackSrc), [playbackSrc]);

  // Load movie
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setPlayerError("");
      try {
        const res = await axiosInstance.get(`/movies/${movieId}`);
        if (!mounted) return;
        setMovie(res.data);
      } catch (e) {
        if (!mounted) return;
        setPlayerError(e?.response?.data?.message || e?.message || "Failed to load movie.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [movieId]);

  // Setup HLS when needed
  useEffect(() => {
    // cleanup previous hls
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (!videoRef.current) return;
    if (sourceInfo.mode !== "hls" || !playbackSrc) return;

    const video = videoRef.current;

    // If Safari supports native HLS
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = playbackSrc;
      return;
    }

    // Use hls.js for other browsers
    (async () => {
      try {
        const Hls = (await import("hls.js")).default;
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hlsRef.current = hls;
          hls.loadSource(playbackSrc);
          hls.attachMedia(video);
          hls.on(Hls.Events.ERROR, (_, data) => {
            if (data?.fatal) {
              setPlayerError("HLS playback error.");
            }
          });
        } else {
          // Fall back to setting src (might not work)
          video.src = playbackSrc;
        }
      } catch (e) {
        setPlayerError("Could not initialize HLS.");
      }
    })();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [sourceInfo.mode, playbackSrc]);

  // When using direct file video
  useEffect(() => {
    if (!videoRef.current) return;
    if (sourceInfo.mode !== "video") return;
    videoRef.current.src = playbackSrc || "";
  }, [sourceInfo.mode, playbackSrc]);

  const openInNewTab = () => {
    if (playbackSrc) window.open(playbackSrc, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Optional: your site navbar
      <Navbar /> */}

      <header className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
        <button
          className="inline-flex items-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg border border-red-600/30 transition"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <h1 className="text-lg sm:text-xl font-semibold truncate">
          {movie?.name || "Loading…"}
        </h1>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10">
        {/* Player container */}
        <div className="relative w-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/40">
          {/* Aspect ratio 16:9 */}
          <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
            {/* INNER ABSOLUTE LAYER */}
            <div className="absolute inset-0 bg-black">
              {loading ? (
                <div className="w-full h-full grid place-items-center text-zinc-400">
                  Loading…
                </div>
              ) : playerError ? (
                <div className="w-full h-full grid place-items-center p-6 text-center">
                  <div className="max-w-lg">
                    <div className="mx-auto mb-3 w-12 h-12 grid place-items-center rounded-full bg-red-600/20 text-red-400">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <p className="text-zinc-300 mb-4">{playerError}</p>
                    {playbackSrc && (
                      <button
                        onClick={openInNewTab}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open video in new tab
                      </button>
                    )}
                  </div>
                </div>
              ) : !playbackSrc ? (
                <div className="w-full h-full grid place-items-center text-zinc-400">
                  No video link available.
                </div>
              ) : sourceInfo.mode === "video" ? (
                <video
                  ref={videoRef}
                  className="w-full h-full"
                  controls
                  playsInline
                  controlsList="nodownload"
                  onError={() => setPlayerError("Video playback error.")}
                />
              ) : sourceInfo.mode === "hls" ? (
                <video
                  ref={videoRef}
                  className="w-full h-full"
                  controls
                  playsInline
                  controlsList="nodownload"
                  onError={() => setPlayerError("Video playback error.")}
                />
              ) : blocked ? (
                <div className="w-full h-full grid place-items-center p-6 text-center">
                  <div className="max-w-lg">
                    <p className="text-zinc-300 mb-3">
                      This provider blocks embedded playback for security reasons.
                    </p>
                    <button
                      onClick={openInNewTab}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-red-600 hover:bg-red-700 font-semibold"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Open Video in New Tab
                    </button>
                    <p className="mt-3 text-xs text-zinc-500">
                      Tip: some providers also block playback when DevTools is open.
                    </p>
                  </div>
                </div>
              ) : (
                <iframe
                  title={movie?.name || "embed"}
                  src={playbackSrc}
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  referrerPolicy="no-referrer"
                  className="w-full h-full"
                />
              )}
            </div>
          </div>
        </div>

        {/* Meta & actions */}
        {movie && (
          <section className="mt-6 grid gap-2 sm:flex sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">{movie.name}</h2>
              <p className="text-sm text-zinc-400 capitalize">
                {movie.type?.replaceAll("-", " ")} · {movie.genre}
              </p>
            </div>

            {/* Watch in new tab button is handy for blocked hosts anyway */}
            {playbackSrc && (
              <a
                href={playbackSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700"
              >
                <Play className="w-4 h-4" />
                Open in new tab
              </a>
            )}
          </section>
        )}

        {/* Episodes list (optional UI for series) */}
        {movie?.type === "web-series" && Array.isArray(movie.episodes) && movie.episodes.length > 0 && (
          <section className="mt-8">
            <h3 className="text-lg font-semibold mb-3">Episodes</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {movie.episodes.map((ep, i) => {
                const active = i === (epIndex ?? 0);
                return (
                  <Link
                    key={`${ep.title}-${i}`}
                    to={`/watch/${movieId}?e=${i}`}
                    className={`px-4 py-3 rounded-lg border transition ${
                      active
                        ? "border-red-600 bg-red-600/10 text-white"
                        : "border-zinc-800 bg-zinc-900/40 hover:border-red-600/40 text-zinc-200"
                    }`}
                  >
                    <div className="text-sm font-medium truncate">Episode {i + 1}</div>
                    <div className="text-xs text-zinc-400 truncate">{ep.title || "Watch"}</div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
