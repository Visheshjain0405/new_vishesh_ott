// backend/controllers/moviesController.js
import Movie from "../models/Movie.js";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

const uploadBufferToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    Readable.from(buffer).pipe(stream);
  });


// map DB doc -> thin card object used by UI
const mapTypeToCategory = {
  "bollywood-movies": "bollywood",
  "south-hindi-dubbed": "southindian-dubbed",
  "hollywood-movies": "hollywood",
  "web-series": "web-series",
};
const toCard = (m) => ({
  _id: m?._id,
  title: m?.name || "",
  description: m?.description || "",
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



export const createMovie = async (req, res) => {
  try {
    // fields
    const {
      name,
      description,
      type,
      genre,
      trailerLink,
      movieLink,
      episodes: episodesJSON,   // when series, frontend will send JSON string
    } = req.body;

    console.log("req.body:", req.body);

    if (!name || !description || !type || !genre) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // upload images if provided
    const files = req.files || {};
    const posters = {};

    if (files.mainPoster?.[0]) {
      const up = await uploadBufferToCloudinary(files.mainPoster[0].buffer, "ott/mainPosters");
      posters.main = { url: up.secure_url, publicId: up.public_id };
    }
    if (files.backgroundPoster?.[0]) {
      const up = await uploadBufferToCloudinary(files.backgroundPoster[0].buffer, "ott/backgroundPosters");
      posters.background = { url: up.secure_url, publicId: up.public_id };
    }
    if (files.mobilePoster?.[0]) {
      const up = await uploadBufferToCloudinary(files.mobilePoster[0].buffer, "ott/mobilePosters");
      posters.mobile = { url: up.secure_url, publicId: up.public_id };
    }

    // parse episodes (if series)
    let episodes = [];
    if (type === "web-series" && episodesJSON) {
      try {
        episodes = JSON.parse(episodesJSON);
      } catch (e) {
        return res.status(400).json({ message: "Invalid episodes JSON" });
      }
    }

    const doc = await Movie.create({
      name,
      description,
      type,
      genre,
      trailerLink,
      movieLink: type !== "web-series" ? movieLink : undefined,
      episodes: type === "web-series" ? episodes : [],
      posters,
    });

    res.status(201).json(doc);
  } catch (err) {
    console.error("createMovie", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const listMovies = async (req, res) => {
  try {
    const { q, type, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (q) filter.name = { $regex: q, $options: "i" };
    if (type) filter.type = type;
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Movie.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Movie.countDocuments(filter),
    ]);
    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const latestForSlider = async (req, res, next) => {
  try {
    const { limit = 5, type, status = "Active" } = req.query;
    console.log("latestForSlider called with:", { limit, type, status });

    const q = {};
    if (type) q.type = type;        // optional filter (bollywood-movies, south-hindi-dubbed, hollywood-movies, web-series)
    if (status) q.status = status;  // default: Active

    const docs = await Movie
      .find(q)
      .sort("-createdAt")
      .limit(Number(limit))
      .lean();

    // map new schema -> slider's existing (old) keys so component doesn't change
    const mapTypeToCategory = {
      "bollywood-movies": "bollywood",
      "south-hindi-dubbed": "southindian-dubbed",
      "hollywood-movies": "hollywood",
      "web-series": "web-series",
    };

    const data = docs.map((m) => ({
      title: m.name,
      description: m.description,
      mainPoster: m?.posters?.main?.url || "",
      backgroundPoster: m?.posters?.background?.url || m?.posters?.main?.url || "",
      mobilePoster: m?.posters?.mobile?.url || m?.posters?.main?.url || "",
      genre: m?.genre || "drama",
      // the old slider shows these; your new schema doesn’t have them, so provide safe fallbacks:
      rating: 0,
      duration: "120",
      cast: "",
      director: "",
      category: mapTypeToCategory[m?.type] || "movie",
      movieLink: m?.movieLink || "",
      trailerLink: m?.trailerLink || "",
      // (optional) you can also return _id if needed by the client
      _id: m?._id,
    }));

    // small cache to reduce flicker if you refresh often
    res.set("Cache-Control", "public, max-age=60");
    res.json({ data, meta: { count: data.length, limit: Number(limit) } });
  } catch (err) {
    next(err);
  }
};

export const categoriesLatest = async (req, res) => {
  try {
    const {
      bLimit = 10,
      sLimit = 10,
      hLimit = 10,
      wLimit = 10,
      status = "Active",
    } = req.query;

    const proj = {
      name: 1, description: 1, type: 1, genre: 1,
      posters: 1, trailerLink: 1, movieLink: 1, createdAt: 1, status: 1,
    };
    const base = status ? { status } : {};

    const [bolly, south, holly, series] = await Promise.all([
      Movie.find({ ...base, type: "bollywood-movies" }, proj).sort("-createdAt").limit(Number(bLimit)).lean(),
      Movie.find({ ...base, type: "south-hindi-dubbed" }, proj).sort("-createdAt").limit(Number(sLimit)).lean(),
      Movie.find({ ...base, type: "hollywood-movies" }, proj).sort("-createdAt").limit(Number(hLimit)).lean(),
      Movie.find({ ...base, type: "web-series" }, proj).sort("-createdAt").limit(Number(wLimit)).lean(),
    ]);

    res.set("Cache-Control", "public, max-age=60");
    res.json({
      data: {
        bollywood: (bolly || []).map(toCard),
        southHindiDubbed: (south || []).map(toCard),
        hollywood: (holly || []).map(toCard),
        webSeries: (series || []).map(toCard),
      },
      meta: {
        limits: {
          bollywood: Number(bLimit),
          southHindiDubbed: Number(sLimit),
          hollywood: Number(hLimit),
          webSeries: Number(wLimit),
        },
        status: status || null,
      },
    });
  } catch (err) {
    console.error("categoriesLatest error:", err);
    res.status(500).json({ message: "Failed to load categories", error: err?.message || "Unknown" });
  }
};



export const getMovie = async (req, res) => {
  try {
    const doc = await Movie.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateMovie = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      type,
      genre,
      trailerLink,
      movieLink,
      episodes: episodesJSON, // stringified from frontend when series
    } = req.body;

    const doc = await Movie.findById(id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    // Build partial update (only set provided fields)
    const update = {};
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    if (type !== undefined) update.type = type;
    if (genre !== undefined) update.genre = genre;
    if (trailerLink !== undefined) update.trailerLink = trailerLink;

    // series vs movie payload
    if (type === "web-series") {
      if (episodesJSON !== undefined) {
        try {
          update.episodes = JSON.parse(episodesJSON);
        } catch (e) {
          return res.status(400).json({ message: "Invalid episodes JSON" });
        }
      }
      update.movieLink = undefined;
    } else {
      if (movieLink !== undefined) update.movieLink = movieLink;
      update.episodes = [];
    }

    // Handle images (if new files uploaded, replace + delete old publicIds)
    const files = req.files || {};
    const posters = { ...doc.posters }; // start with existing

    const maybeReplace = async (fieldKey, folder) => {
      const f = files[fieldKey]?.[0];
      if (!f) return;
      // upload new
      const up = await uploadBufferToCloudinary(f.buffer, folder);
      // destroy old if existed
      const oldPid = posters?.[fieldKey === "mainPoster" ? "main" :
                               fieldKey === "backgroundPoster" ? "background" : "mobile"]?.publicId;
      if (oldPid) await cloudinary.uploader.destroy(oldPid);

      // set new
      const slot = fieldKey === "mainPoster" ? "main" :
                   fieldKey === "backgroundPoster" ? "background" : "mobile";
      posters[slot] = { url: up.secure_url, publicId: up.public_id };
    };

    await maybeReplace("mainPoster", "ott/mainPosters");
    await maybeReplace("backgroundPoster", "ott/backgroundPosters");
    await maybeReplace("mobilePoster", "ott/mobilePosters");

    update.posters = posters;

    const updated = await Movie.findByIdAndUpdate(id, update, { new: true });
    res.json(updated);
  } catch (err) {
    console.error("updateMovie", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


export const deleteMovie = async (req, res) => {
  try {
    const doc = await Movie.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    // cleanup Cloudinary
    const ids = [
      doc.posters?.main?.publicId,
      doc.posters?.background?.publicId,
      doc.posters?.mobile?.publicId,
    ].filter(Boolean);

    await Promise.all(ids.map((pid) => cloudinary.uploader.destroy(pid)));

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
