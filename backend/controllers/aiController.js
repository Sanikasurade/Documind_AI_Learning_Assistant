const Document = require("../models/Document");
const Flashcard = require("../models/Flashcard");
const Quiz = require("../models/Quiz");
const geminiService = require("../services/geminiService");

// Helper: get document and verify ownership
const getDocumentForUser = async (docId, userId) => {
  const document = await Document.findOne({ _id: docId, userId });
  if (!document) throw Object.assign(new Error("Document not found."), { statusCode: 404 });
  return document;
};

// @desc    Chat with document
// @route   POST /api/v1/ai/chat
const chatWithDocument = async (req, res) => {
  const { documentId, question } = req.body;

  if (!documentId || !question) {
    return res.status(400).json({ success: false, message: "documentId and question are required." });
  }

  const document = await getDocumentForUser(documentId, req.user._id);
  
  const history = document.chatHistory || [];
  const answer = await geminiService.chat(document.extractedText, question, history);

  // Save to database
  document.chatHistory.push({ role: "user", content: question });
  document.chatHistory.push({ role: "model", content: answer });
  await document.save();

  res.status(200).json({ success: true, answer, chatHistory: document.chatHistory });
};

// @desc    Generate summary
// @route   POST /api/v1/ai/summary
const generateSummary = async (req, res) => {
  const { documentId } = req.body;
  if (!documentId) return res.status(400).json({ success: false, message: "documentId is required." });

  const document = await getDocumentForUser(documentId, req.user._id);
  const summary = await geminiService.summarize(document.extractedText);

  // Cache summary on document
  document.summary = summary;
  await document.save();

  res.status(200).json({ success: true, summary });
};

// @desc    Explain a concept
// @route   POST /api/v1/ai/explain
const explainConcept = async (req, res) => {
  const { documentId, concept } = req.body;
  if (!documentId || !concept) {
    return res.status(400).json({ success: false, message: "documentId and concept are required." });
  }

  const document = await getDocumentForUser(documentId, req.user._id);
  const explanation = await geminiService.explain(document.extractedText, concept);

  res.status(200).json({ success: true, explanation });
};

// @desc    Generate flashcards
// @route   POST /api/v1/ai/flashcards
const generateFlashcards = async (req, res) => {
  const { documentId, setName } = req.body;
  if (!documentId) return res.status(400).json({ success: false, message: "documentId is required." });

  const document = await getDocumentForUser(documentId, req.user._id);
  const cards = await geminiService.generateFlashcards(document.extractedText);

  const flashcardSet = await Flashcard.create({
    userId: req.user._id,
    documentId,
    setName: setName || `${document.title} – Set ${Date.now()}`,
    cards,
  });

  // Update flashcard count on document
  document.flashcardCount = (document.flashcardCount || 0) + 1;
  await document.save();

  res.status(201).json({ success: true, flashcardSet });
};

// @desc    Generate quiz
// @route   POST /api/v1/ai/quiz
const generateQuiz = async (req, res) => {
  const { documentId, numQuestions = 10, quizTitle } = req.body;
  if (!documentId) return res.status(400).json({ success: false, message: "documentId is required." });

  const document = await getDocumentForUser(documentId, req.user._id);
  const questions = await geminiService.generateQuiz(document.extractedText, numQuestions);

  const quiz = await Quiz.create({
    userId: req.user._id,
    documentId,
    title: quizTitle || `${document.title} Quiz`,
    questions,
  });

  // Update quiz count on document
  document.quizCount = (document.quizCount || 0) + 1;
  await document.save();

  res.status(201).json({ success: true, quiz });
};

module.exports = {
  chatWithDocument,
  generateSummary,
  explainConcept,
  generateFlashcards,
  generateQuiz,
};
