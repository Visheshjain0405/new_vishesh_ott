import User from "../models/User.js";
import { signToken, cookieOptions } from "../utils/jwt.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

const publicFields = "firstName lastName email role createdAt";

const buildUser = (u) => ({
  _id: u._id,
  firstName: u.firstName,
  lastName: u.lastName,
  email: u.email,
  role: u.role,
  createdAt: u.createdAt,
});

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const user = await User.create({ firstName, lastName, email, password });
    const token = signToken({ id: user._id, role: user.role }, process.env.JWT_EXPIRES_IN || "15m");
    res
      .cookie("token", token, cookieOptions(false))
      .status(201)
      .json({ user: buildUser(user), token }); // token also in json if you prefer header use
  } catch (err) {
    console.error("register", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });

    const exp = rememberMe
      ? process.env.JWT_REMEMBER_EXPIRES_IN || "7d"
      : process.env.JWT_EXPIRES_IN || "15m";
    const token = signToken({ id: user._id, role: user.role }, exp);

    res
      .cookie("token", token, cookieOptions(rememberMe))
      .json({ user: buildUser(user), token });
  } catch (err) {
    console.error("login", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Not found" });
    res.json({ user: buildUser(user) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = async (_req, res) => {
  res.clearCookie("token").json({ message: "Logged out" });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.json({ message: "If account exists, email has been sent" }); // do not reveal

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      html: `
        <p>We received a request to reset your password.</p>
        <p><a href="${resetURL}">Click here to reset</a> (valid for 15 minutes).</p>
        <p>If you didn't request this, ignore this email.</p>
      `,
    });

    res.json({ message: "Reset link sent (if account exists)" });
  } catch (err) {
    console.error("forgotPassword", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+password");

    if (!user) return res.status(400).json({ message: "Token invalid or expired" });

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("resetPassword", err);
    res.status(500).json({ message: "Server error" });
  }
};

// placeholder for Google OAuth (frontend button currently just alerts)
export const googleAuthStart = async (_req, res) => {
  res.status(501).json({ message: "Google OAuth not implemented yet" });
};

export const listUsers = async (req, res) => {
  try {
    // ?page=1&limit=20&sort=-createdAt&q=john
    const page  = Math.max(1, parseInt(req.query.page ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit ?? "20", 10)));
    const sort  = req.query.sort ?? "-createdAt";
    const q     = (req.query.q ?? "").trim();

    const filter = q
      ? {
          $or: [
            { firstName: { $regex: q, $options: "i" } },
            { lastName:  { $regex: q, $options: "i" } },
            { email:     { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const total = await User.countDocuments(filter);
    const items = await User.find(filter)
      .select(publicFields)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      items,
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    console.error("listUsers", err);
    res.status(500).json({ message: "Server error" });
  }
};

// optional: “recent users” shortcut (e.g., for dashboard widgets)
export const recentUsers = async (req, res) => {
  try {
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit ?? "5", 10)));
    const items = await User.find({})
      .select(publicFields)
      .sort("-createdAt")
      .limit(limit)
      .lean();

    res.json({ items, total: items.length });
  } catch (err) {
    console.error("recentUsers", err);
    res.status(500).json({ message: "Server error" });
  }
};
