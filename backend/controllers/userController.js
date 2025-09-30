// controllers/userController.js
import User from "../models/User.js";

export const listUsersSimple = async (req, res) => {
  try {
    const limit = Math.max(1, parseInt(req.query.limit ?? "50", 10)); // optional ?limit=10
    const users = await User.find({}, "firstName lastName email role createdAt")
      .sort("-createdAt")
      .limit(limit)
      .lean();

    res.json(users); // just an array, no pagination metadata
  } catch (err) {
    console.error("listUsersSimple", err);
    res.status(500).json({ message: "Server error" });
  }
};
