import mongoose from "mongoose";

const FavoriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
  },
  { timestamps: true }
);

// Prevent duplicates: one favorite per (user, movie)
FavoriteSchema.index({ user: 1, movie: 1 }, { unique: true });

export default mongoose.model("Favorite", FavoriteSchema);
