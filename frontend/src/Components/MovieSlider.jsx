import { useState, useEffect, useMemo } from "react";
import axiosInstance from "../Assests/api/axiosInstance";

export default function MovieSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const [moviesData, setMoviesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // Helpers
  const formatDuration = (minutesStr) => {
    const minutes = parseInt(minutesStr || "0", 10);
    if (Number.isNaN(minutes) || minutes <= 0) return "—";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const getGenreColor = (genre) => {
    const colors = {
      action: "bg-red-600",
      romance: "bg-pink-600",
      drama: "bg-blue-600",
      comedy: "bg-yellow-600",
      thriller: "bg-purple-600",
      horror: "bg-gray-800",
    };
    return colors[(genre || "").toLowerCase()] || "bg-gray-600";
  };

  const sliderMovies = useMemo(() => moviesData ?? [], [moviesData]);

  // Fetch latest 5 from the new endpoint
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await axiosInstance.get("/movies/latest", {
          params: { limit: 5 }, // add ?type=bollywood-movies if needed
        });
        if (!mounted) return;

        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setMoviesData(data);
        setErrMsg(data.length ? "" : "No movies found");
      } catch (err) {
        console.error("Error loading movies:", err);
        if (!mounted) return;
        setErrMsg("Failed to load movies.");
        setMoviesData([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Auto-slide
  useEffect(() => {
    if (!isAutoPlaying || sliderMovies.length === 0) return;
    const id = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === sliderMovies.length - 1 ? 0 : prev + 1
      );
    }, 5000);
    return () => clearInterval(id);
  }, [isAutoPlaying, sliderMovies.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 6000);
  };

  const goToPrevious = () => {
    if (sliderMovies.length === 0) return;
    setCurrentIndex((prev) =>
      prev === 0 ? sliderMovies.length - 1 : prev - 1
    );
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 6000);
  };

  const goToNext = () => {
    if (sliderMovies.length === 0) return;
    setCurrentIndex((prev) =>
      prev === sliderMovies.length - 1 ? 0 : prev + 1
    );
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 6000);
  };

  const handleImageError = (movieIndex) => {
    setImageLoadErrors((prev) => ({ ...prev, [movieIndex]: true }));
  };

  return (
    <div className="relative w-full bg-black">
      {loading ? (
        // Skeleton
        <div className="h-[70vh] sm:h-[80vh] lg:h-[85vh] flex items-center justify-center">
          <div className="text-white text-xl animate-pulse">Loading movies…</div>
        </div>
      ) : sliderMovies.length === 0 ? (
        <div className="h-[70vh] sm:h-[80vh] lg:h-[85vh] flex items-center justify-center">
          <div className="text-white text-xl">{errMsg || "No movies found"}</div>
        </div>
      ) : (
        <>
          {/* Main Slider */}
          <div className="relative h-[70vh] sm:h-[80vh] lg:h-[85vh] overflow-hidden">
            {/* Slides */}
            <div
              className="flex transition-transform duration-1000 ease-in-out h-full"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {sliderMovies.map((movie, index) => (
                <div key={movie._id || index} className="min-w-full h-full relative">
                  {/* Background */}
                  <div className="absolute inset-0">
                    <img
                      src={
                        imageLoadErrors[index]
                          ? movie.mainPoster
                          : movie.backgroundPoster || movie.mainPoster
                      }
                      alt={movie.title}
                      className="w-full h-full object-cover hidden sm:block"
                      onError={() => handleImageError(index)}
                      loading={index === currentIndex ? "eager" : "lazy"}
                    />
                    <img
                      src={
                        imageLoadErrors[index]
                          ? movie.mainPoster
                          : movie.mobilePoster || movie.mainPoster
                      }
                      alt={movie.title}
                      className="w-full h-full object-cover sm:hidden"
                      onError={() => handleImageError(index)}
                      loading={index === currentIndex ? "eager" : "lazy"}
                    />
                    {/* Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 h-full flex items-center px-4 sm:px-8 lg:px-16">
                    <div className="max-w-4xl">
                      {/* Badge */}
                      <div className="mb-4">
                        <span className="px-3 py-1 bg-red-600/90 text-white text-xs sm:text-sm font-semibold rounded-full uppercase tracking-wide backdrop-blur-sm">
                          {movie.category?.replace("-", " ") || "Movie"}
                        </span>
                      </div>

                      {/* Title */}
                      <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white mb-4 leading-tight">
                        {movie.title}
                      </h1>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                        <span className="text-yellow-400 font-bold text-sm sm:text-base">
                          ⭐ {movie.rating ?? 0}/10
                        </span>
                        {/* you don't send releaseYear in the slider endpoint; hide it gracefully */}
                        {/* <span className="text-gray-300 text-sm sm:text-base">{movie.releaseYear}</span> */}
                        <span className="text-gray-300 text-sm sm:text-base">
                          {formatDuration(movie.duration)}
                        </span>
                        <span
                          className={`px-2 py-1 text-white text-xs sm:text-sm font-medium rounded-full ${getGenreColor(
                            movie.genre
                          )}`}
                        >
                          {(movie.genre || "movie").toUpperCase()}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-gray-300 text-sm sm:text-lg mb-6 sm:mb-8 max-w-2xl leading-relaxed line-clamp-3">
                        {movie.description}
                      </p>

                      {/* Director & Cast (optional in slider payload) */}
                      {(movie.director || movie.cast) && (
                        <div className="mb-6 sm:mb-8 space-y-2 text-sm sm:text-base">
                          {movie.director && (
                            <p className="text-gray-400">
                              <span className="text-white font-semibold">Director:</span>{" "}
                              {movie.director}
                            </p>
                          )}
                          {movie.cast && (
                            <p className="text-gray-400">
                              <span className="text-white font-semibold">Cast:</span>{" "}
                              {movie.cast}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            movie.movieLink && window.open(movie.movieLink, "_blank")
                          }
                          className="px-6 sm:px-8 py-3 sm:py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-500/25 transform hover:scale-105"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                            Watch Now
                          </span>
                        </button>

                        {movie.trailerLink && (
                          <button
                            onClick={() =>
                              window.open(movie.trailerLink, "_blank")
                            }
                            className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all duration-300 backdrop-blur-sm"
                          >
                            Trailer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Nav Arrows */}
            <button
              onClick={goToPrevious}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-300 backdrop-blur-sm z-20 hover:scale-110"
              aria-label="Previous slide"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={goToNext}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-300 backdrop-blur-sm z-20 hover:scale-110"
              aria-label="Next slide"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Autoplay Toggle */}
            <div className="absolute top-4 right-4 z-30">
              <button
                onClick={() => setIsAutoPlaying((v) => !v)}
                className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
                  isAutoPlaying
                    ? "bg-red-600/90 text-white hover:bg-red-700"
                    : "bg-gray-800/90 text-gray-300 hover:bg-gray-700"
                }`}
                aria-label={isAutoPlaying ? "Pause autoplay" : "Start autoplay"}
              >
                {isAutoPlaying ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center py-6 gap-2">
            {sliderMovies.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-3 rounded-full transition-all duration-300 hover:scale-110 ${
                  index === currentIndex ? "bg-red-600 w-8" : "bg-gray-600 w-3 hover:bg-gray-500"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
