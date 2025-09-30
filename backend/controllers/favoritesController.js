import mongoose from "mongoose";
import Favorite from "../models/Favorite.js";
import Movie from "../models/Movie.js";

const mapTypeToCategory = {
  "bollywood-movies": "bollywood",
  "south-hindi-dubbed": "southindian-dubbed",
  "hollywood-movies": "hollywood",
  "web-series": "web-series",
};

const toCard = (m) => ({
  _id: m._id,
  title: m.name,
  description: m.description,
  mainPoster: m?.posters?.main?.url || "",
  backgroundPoster: m?.posters?.background?.url || m?.posters?.main?.url || "",
  mobilePoster: m?.posters?.mobile?.url || m?.posters?.main?.url || "",
  genre: m?.genre || "drama",
  rating: 0,
  duration: "120",
  cast: "",
  director: "",
  category: mapTypeToCategory[m?.type] || "movie",
  movieLink: m?.movieLink || "",
  trailerLink: m?.trailerLink || "",
});

export const getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id; // <— protect sets { id, role }
    const favs = await Favorite.find({ user: userId }).select("movie -_id").lean();
    const movieIds = favs.map((f) => f.movie);

    const movies = await Movie.find(
      { _id: { $in: movieIds }, status: "Active" },
      { name: 1, description: 1, type: 1, genre: 1, posters: 1, trailerLink: 1, movieLink: 1 }
    ).lean();

    res.json({ data: movies.map(toCard), meta: { count: movies.length } });
  } catch (err) {
    next(err);
  }
};

export const getFavoriteIds = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const favs = await Favorite.find({ user: userId }).select("movie -_id").lean();
    res.json({ data: favs.map((f) => String(f.movie)) });
  } catch (err) {
    next(err);
  }
};

export const addFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ message: "Invalid movieId" });
    }

    const exists = await Movie.exists({ _id: movieId });
    if (!exists) return res.status(404).json({ message: "Movie not found" });

    await Favorite.updateOne(
      { user: userId, movie: movieId },
      { $setOnInsert: { user: userId, movie: movieId } },
      { upsert: true }
    );

    res.status(201).json({ message: "Added to favorites", movieId });
  } catch (err) {
    if (err?.code === 11000) return res.status(201).json({ message: "Already in favorites" });
    next(err);
  }
};

export const removeFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ message: "Invalid movieId" });
    }

    await Favorite.deleteOne({ user: userId, movie: movieId });
    res.json({ message: "Removed from favorites", movieId });
  } catch (err) {
    next(err);
  }
};
