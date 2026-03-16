const express = require("express");
const router = express.Router();
const {
  getAllFlashcards,
  getFlashcardsByDocument,
  toggleFavorite,
  deleteFlashcardSet,
} = require("../controllers/flashcardController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

// @route  GET /api/v1/flashcards
router.get("/", getAllFlashcards);

// @route  GET /api/v1/flashcards/:docId
router.get("/:docId", getFlashcardsByDocument);

// @route  PATCH /api/v1/flashcards/:id/favorite
router.patch("/:id/favorite", toggleFavorite);

// @route  DELETE /api/v1/flashcards/:id
router.delete("/:id", deleteFlashcardSet);

module.exports = router;
