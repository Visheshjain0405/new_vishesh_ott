import { useEffect, useState } from "react";
import {
    Play, Heart, Share2, Eye, Bookmark, ArrowLeft, ChevronRight
} from "lucide-react";
import axiosInstance from "../Assests/api/axiosInstance";

import { useParams, useNavigate } from "react-router-dom";

export default function MovieSinglePage({ movieId: propMovieId, initialMovie }) {
    const { movieId } = useParams();
    //   const movieId = propMovieId || initialMovie?._id;

    const [movie, setMovie] = useState(initialMovie || null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [loading, setLoading] = useState(!initialMovie);
    const navigate = useNavigate();
    // fetch movie if not provided
    useEffect(() => {
        if (movie) return;
        (async () => {
            try {
                const res = await axiosInstance.get(`/movies/${movieId}`);
                setMovie(res.data);
            } catch (e) {
                // handle 404, etc.
            } finally {
                setLoading(false);
            }
        })();
    }, [movie, movieId]);

    // fetch favorite state for this movie
    useEffect(() => {
        if (!movieId) return;
        (async () => {
            try {
                const res = await axiosInstance.get("/favorites/ids");
                const ids = new Set((res.data?.data || []).map(String));
                setIsFavorite(ids.has(String(movieId)));
            } catch {
                // ignore unauth
            }
        })();
    }, [movieId]);

    const handleWatchMovie = () => {
        if (!movie?._id) return;
        navigate(`/watch/${movie._id}`);
    };

    const handleWatchTrailer = () => {
        if (movie?.trailerLink) window.open(movie.trailerLink, "_blank");
    };
    
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: movie?.name,
                text: movie?.description,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    const toggleFavorite = async () => {
        if (!movie?._id) return;
        const id = String(movie._id);

        // optimistic
        setIsFavorite((prev) => !prev);
        try {
            if (!isFavorite) {
                await axiosInstance.post(`/favorites/${id}`);
            } else {
                await axiosInstance.delete(`/favorites/${id}`);
            }
        } catch {
            // revert on error
            setIsFavorite((prev) => !prev);
        }
    };

    if (loading || !movie) {
        return (
            <div className="min-h-screen bg-black text-white grid place-items-center">
                <div className="text-zinc-400">Loading…</div>
            </div>
        );
    }

    const backgroundImage = movie?.posters?.background?.url || movie?.posters?.main?.url;
    const mobileBackground = movie?.posters?.mobile?.url || backgroundImage;

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="relative min-h-screen">
                {/* desktop bg */}
                <div
                    className="hidden md:block absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: backgroundImage && !imageError ? `url(${backgroundImage})` : "none",
                        backgroundColor: !backgroundImage || imageError ? "#111" : "transparent",
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
                </div>
                {/* mobile bg */}
                <div
                    className="md:hidden absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: mobileBackground && !imageError ? `url(${mobileBackground})` : "none",
                        backgroundColor: !mobileBackground || imageError ? "#111" : "transparent",
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
                </div>

                {/* header */}
                <header className="relative z-10 p-4 sm:p-6 lg:p-8">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center gap-2 px-3 py-2 bg-black/50 hover:bg-black/70 rounded-lg backdrop-blur-sm transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Back</span>
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleFavorite}
                                className={`p-2 rounded-full backdrop-blur-sm transition-all ${isFavorite ? "bg-red-600 text-white" : "bg-black/50 hover:bg-red-600/20 text-white"
                                    }`}
                            >
                                <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                            </button>
                            <button
                                onClick={handleShare}
                                className="p-2 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-colors"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* main */}
                <main className="relative z-10 px-4 sm:px-6 lg:px-8 pb-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">

                            {/* mobile poster */}
                            <div className="lg:hidden flex justify-center mb-6">
                                <div className="w-64 sm:w-72 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl">
                                    <img
                                        src={movie?.posters?.main?.url}
                                        alt={movie?.name}
                                        className="w-full h-full object-cover"
                                        onError={() => setImageError(true)}
                                    />
                                </div>
                            </div>

                            {/* info */}
                            <div className="lg:col-span-8 space-y-6">
                                <div>
                                    <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-2">
                                        {movie?.name}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-4 text-sm sm:text-base text-zinc-300">
                                        <span className="px-3 py-1 bg-zinc-800/60 border border-zinc-700 rounded-full text-sm capitalize">
                                            {movie?.type?.replace("-", " ")}
                                        </span>
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${movie?.status === "Active"
                                                    ? "bg-green-600/20 border border-green-600/30 text-green-400"
                                                    : "bg-zinc-800/60 border border-zinc-700 text-zinc-300"
                                                }`}
                                        >
                                            {movie?.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-4 py-2 bg-red-600/20 border border-red-600/30 rounded-lg text-sm font-semibold text-red-400 capitalize">
                                            {movie?.genre}
                                        </span>
                                    </div>
                                </div>

                                {/* actions */}
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={handleWatchMovie}
                                        className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-red-600/25"
                                    >
                                        <Play className="w-5 h-5" />
                                        Watch Now
                                    </button>
                                    {movie?.trailerLink && movie.trailerLink.trim() !== "" && (
                                        <button
                                            onClick={handleWatchTrailer}
                                            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-colors backdrop-blur-sm border border-white/20"
                                        >
                                            <Eye className="w-5 h-5" />
                                            Trailer
                                        </button>
                                    )}

                                </div>

                                {/* synopsis */}
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold mb-3">Synopsis</h2>
                                    <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
                                        {movie?.description}
                                    </p>
                                </div>

                                {/* options */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Movie Information</h3>
                                        <div className="space-y-3 text-sm sm:text-base">
                                            <div className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                                                <span className="text-zinc-400">Category:</span>
                                                <span className="text-zinc-300 capitalize">{movie?.type?.replace("-", " ")}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                                                <span className="text-zinc-400">Genre:</span>
                                                <span className="text-zinc-300 capitalize">{movie?.genre}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                                                <span className="text-zinc-400">Status:</span>
                                                <span className={movie?.status === "Active" ? "text-green-400" : "text-zinc-300"}>
                                                    {movie?.status}
                                                </span>
                                            </div>
                                            {Array.isArray(movie?.episodes) && movie.episodes.length > 0 && (
                                                <div className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                                                    <span className="text-zinc-400">Episodes:</span>
                                                    <span className="text-zinc-300">{movie.episodes.length}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Watch Options</h3>
                                        <div className="space-y-3">
                                            {movie?.movieLink && (
                                                <button
                                                    onClick={handleWatchMovie}
                                                    className="w-full p-4 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 rounded-lg transition-colors text-left group"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Play className="w-4 h-4 text-red-400" />
                                                                <span className="text-red-400 font-medium">Watch Movie</span>
                                                            </div>
                                                            <p className="text-xs text-zinc-400">Stream now</p>
                                                        </div>
                                                        <ChevronRight className="w-5 h-5 text-red-400 group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                </button>
                                            )}

                                            {movie?.trailerLink && movie.trailerLink.trim() !== "" ? (
                                                <button
                                                    onClick={handleWatchTrailer}
                                                    className="w-full p-4 bg-zinc-900/30 hover:bg-zinc-900/50 border border-zinc-700 rounded-lg transition-colors text-left group"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Eye className="w-4 h-4 text-zinc-400" />
                                                                <span className="text-zinc-300 font-medium">Watch Trailer</span>
                                                            </div>
                                                            <p className="text-xs text-zinc-400">Preview available</p>
                                                        </div>
                                                        <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                </button>
                                            ) : (
                                                <div className="w-full p-4 bg-zinc-900/20 border border-zinc-800 rounded-lg">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Eye className="w-4 h-4 text-zinc-600" />
                                                        <span className="text-zinc-600 font-medium">Trailer</span>
                                                    </div>
                                                    <p className="text-xs text-zinc-500">Not available</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* desktop poster */}
                            <div className="hidden lg:block lg:col-span-4">
                                <div className="sticky top-8">
                                    <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl hover:shadow-red-500/20 transition-shadow duration-300">
                                        <img
                                            src={movie?.posters?.main?.url}
                                            alt={movie?.name}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                            onError={() => setImageError(true)}
                                        />
                                    </div>

                                    <div className="mt-6 space-y-3">
                                        <button
                                            onClick={handleWatchMovie}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
                                        >
                                            <Play className="w-5 h-5" />
                                            Watch Now
                                        </button>
                                        {movie?.trailerLink && movie.trailerLink.trim() !== "" && (
                                            <button
                                                onClick={handleWatchTrailer}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-colors backdrop-blur-sm border border-white/20"
                                            >
                                                <Eye className="w-5 h-5" />
                                                Watch Trailer
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
