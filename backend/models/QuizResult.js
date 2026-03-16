const mongoose = require("mongoose");

const detailedResultSchema = new mongoose.Schema({
  question: String,
  options: {
    A: String,
    B: String,
    C: String,
    D: String,
  },
  userAnswer: String,
  correctAnswer: String,
  explanation: String,
  isCorrect: Boolean,
});

const quizResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    timeTaken: {
      type: Number, // seconds
      default: 0,
    },
    detailedResults: [detailedResultSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("QuizResult", quizResultSchema);
