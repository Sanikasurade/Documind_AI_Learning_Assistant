const express = require("express");
const router = express.Router();
const {
  chatWithDocument,
  generateSummary,
  explainConcept,
  generateFlashcards,
  generateQuiz,
} = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

// @route  POST /api/v1/ai/chat
router.post("/chat", chatWithDocument);

// @route  POST /api/v1/ai/summary
router.post("/summary", generateSummary);

// @route  POST /api/v1/ai/explain
router.post("/explain", explainConcept);

// @route  POST /api/v1/ai/flashcards
router.post("/flashcards", generateFlashcards);

// @route  POST /api/v1/ai/quiz
router.post("/quiz", generateQuiz);

module.exports = router;
