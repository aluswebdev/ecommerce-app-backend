import express from "express";
import {
  fetchSearchResults,
  fetchSuggestions,
} from "../../controllers/search/search.controller.js";

const router = express.Router();

// Route to fetch search suggestions
router.get("/suggestions", fetchSuggestions);
router.get("/results", fetchSearchResults);

export default router;