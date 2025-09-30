import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    // 1) Try Authorization: Bearer <token>
    let token = null;
    const auth = req.headers.authorization;
    if (auth && auth.startsWith("Bearer ")) {
      token = auth.split(" ")[1];
    }
    // 2) Fallback to cookie
    if (!token && req.cookies?.token) token = req.cookies.token;

    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // normalized: controllers may read id or _id
    req.user = { id: decoded.id, _id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role))
    return res.status(403).json({ message: "Forbidden" });
  next();
};
