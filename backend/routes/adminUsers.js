// routes/adminUsers.js
import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { restrictTo } from "../middleware/auth.js"; // same file where you defined it
import { listUsersSimple } from "../controllers/userController.js";

const router = Router();

router.get("/admin/users", listUsersSimple);

export default router;
