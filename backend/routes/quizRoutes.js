const express = require("express");
const router = express.Router();
const {
  getQuizzesByDocument,
  getQuiz,
  submitQuiz,
  getQuizResult,
} = require("../controllers/quizController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

// @route  GET /api/v1/quizzes/document/:docId
router.get("/document/:docId", getQuizzesByDocument);

// @route  GET /api/v1/quizzes/:id
router.get("/:id", getQuiz);

// @route  POST /api/v1/quizzes/:id/submit
router.post("/:id/submit", submitQuiz);

// @route  GET /api/v1/quizzes/:id/result
router.get("/:id/result", getQuizResult);

module.exports = router;
