const Quiz = require("../models/Quiz");
const QuizResult = require("../models/QuizResult");

// @desc    Get all quizzes for a document
// @route   GET /api/v1/quizzes/document/:docId
const getQuizzesByDocument = async (req, res) => {
  const quizzes = await Quiz.find({
    userId: req.user._id,
    documentId: req.params.docId,
  })
    .select("-questions.explanation")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: quizzes.length, quizzes });
};

// @desc    Get a single quiz (without correct answers for active quiz)
// @route   GET /api/v1/quizzes/:id
const getQuiz = async (req, res) => {
  const quiz = await Quiz.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!quiz) {
    return res.status(404).json({ success: false, message: "Quiz not found." });
  }

  // Strip correct answers when serving for play (security)
  const safeQuestions = quiz.questions.map((q) => ({
    _id: q._id,
    question: q.question,
    options: q.options,
  }));

  res.status(200).json({
    success: true,
    quiz: {
      _id: quiz._id,
      title: quiz.title,
      questions: safeQuestions,
      createdAt: quiz.createdAt,
    },
  });
};

// @desc    Submit quiz answers
// @route   POST /api/v1/quizzes/:id/submit
const submitQuiz = async (req, res) => {
  const { answers, timeTaken } = req.body;
  // answers: [{ questionIndex: 0, selectedOption: "A" }, ...]

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ success: false, message: "answers array is required." });
  }

  const quiz = await Quiz.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!quiz) {
    return res.status(404).json({ success: false, message: "Quiz not found." });
  }

  // Grade answers
  let score = 0;
  const detailedResults = quiz.questions.map((q, index) => {
    const userAnswer = answers[index]?.selectedOption || null;
    const isCorrect = userAnswer === q.correctAnswer;
    if (isCorrect) score++;

    return {
      question: q.question,
      options: q.options,
      userAnswer,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      isCorrect,
    };
  });

  const quizResult = await QuizResult.create({
    userId: req.user._id,
    quizId: quiz._id,
    documentId: quiz.documentId,
    score,
    totalQuestions: quiz.questions.length,
    percentage: Math.round((score / quiz.questions.length) * 100),
    detailedResults,
    timeTaken: timeTaken || 0,
  });

  res.status(201).json({ success: true, result: quizResult });
};

// @desc    Get quiz result
// @route   GET /api/v1/quizzes/:id/result
const getQuizResult = async (req, res) => {
  const result = await QuizResult.findOne({
    quizId: req.params.id,
    userId: req.user._id,
  }).sort({ createdAt: -1 });

  if (!result) {
    return res.status(404).json({ success: false, message: "No result found for this quiz." });
  }

  res.status(200).json({ success: true, result });
};

module.exports = { getQuizzesByDocument, getQuiz, submitQuiz, getQuizResult };
