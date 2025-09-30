// backend/middleware/requireAuth.js
export default function requireAuth(req, res, next) {
  const uid = req.user?.id || req.user?._id;
  if (!uid) return res.status(401).json({ message: "Unauthorized" });
  next();
}
