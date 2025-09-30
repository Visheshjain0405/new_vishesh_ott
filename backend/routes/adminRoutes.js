import express from "express";
import { registerAdmin, loginAdmin } from "../controllers/adminController.js";

const router = express.Router();

router.post("/register", registerAdmin); // ✅ Create new admin
router.post("/login", loginAdmin);       // ✅ Login admin

export default router;
