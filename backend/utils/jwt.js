import jwt from "jsonwebtoken";

export const signToken = (payload, expiresIn) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });

export const cookieOptions = (rememberMe = false) => {
  const age = rememberMe
    ? parseMs(process.env.JWT_REMEMBER_EXPIRES_IN || "7d")
    : parseMs(process.env.JWT_EXPIRES_IN || "15m");
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: age,
  };
};

// "7d" / "15m" to ms helper
function parseMs(text) {
  if (!text) return 15 * 60 * 1000;
  const num = parseInt(text, 10);
  if (text.endsWith("ms")) return num;
  if (text.endsWith("s")) return num * 1000;
  if (text.endsWith("m")) return num * 60 * 1000;
  if (text.endsWith("h")) return num * 60 * 60 * 1000;
  if (text.endsWith("d")) return num * 24 * 60 * 60 * 1000;
  return num; // fallback
}
