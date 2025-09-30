import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  getFavorites,
  getFavoriteIds,
  addFavorite,
  removeFavorite,
} from "../controllers/favoritesController.js";

const router = Router();

router.use(protect); // <-- critical

router.get("/", getFavorites);
router.get("/ids", getFavoriteIds);
router.post("/:movieId", addFavorite);
router.delete("/:movieId", removeFavorite);

export default router;
