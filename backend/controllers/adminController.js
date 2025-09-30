import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import logger from "../config/logger.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// ✅ Register new admin
export const registerAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const exists = await Admin.findOne({ email });
    if (exists) {
      logger.warn(`Attempt to register existing admin: ${email}`);
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      email,
      password: hashedPassword,
    });

    logger.info(`✅ New admin registered: ${email}`);
    res.status(201).json({
      _id: admin._id,
      email: admin.email,
      token: generateToken(admin._id),
    });
  } catch (err) {
    logger.error(`❌ Register failed: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Login admin
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (admin && (await admin.matchPassword(password))) {
      logger.info(`✅ Admin logged in: ${email}`);
      res.json({
        _id: admin._id,
        email: admin.email,
        token: generateToken(admin._id),
      });
    } else {
      logger.warn(`❌ Invalid login attempt: ${email}`);
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    logger.error(`❌ Login failed: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};
