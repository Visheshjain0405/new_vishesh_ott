import { Router } from "express";
import { upload } from "../middleware/upload.js";
import {
  createMovie,
  listMovies,
  getMovie,
  updateMovie,
  deleteMovie,
  latestForSlider,
  categoriesLatest,    // <-- import it
} from "../controllers/moviesController.js";

const router = Router();

// ORDER MATTERS
router.get("/", listMovies);
router.get("/latest", latestForSlider);
router.get("/categories", categoriesLatest);  // <-- add this line BEFORE :id
router.get("/:id", getMovie);

router.post("/", upload, createMovie);
router.put("/:id", upload, updateMovie);
router.delete("/:id", deleteMovie);

export default router;
