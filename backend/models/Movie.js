// backend/models/Movie.js
import mongoose from "mongoose";

const EpisodeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    link: { type: String, required: true },
  },
  { _id: false }
);

const PostersSchema = new mongoose.Schema(
  {
    main: { url: String, publicId: String },
    background: { url: String, publicId: String },
    mobile: { url: String, publicId: String },
  },
  { _id: false }
);

const MovieSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ["bollywood-movies", "south-hindi-dubbed", "hollywood-movies", "web-series"],
      required: true,
    },
    genre: { type: String, required: true },
    trailerLink: { type: String },
    movieLink: { type: String },                 // for movies
    episodes: [EpisodeSchema],                   // for series
    posters: PostersSchema,                      // cloudinary info
    status: { type: String, default: "Active" },
  },
  { timestamps: true }
);

export default mongoose.model("Movie", MovieSchema);
