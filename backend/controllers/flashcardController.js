const Flashcard = require("../models/Flashcard");

// @desc    Get all flashcards for user
// @route   GET /api/v1/flashcards
const getAllFlashcards = async (req, res) => {
  const flashcards = await Flashcard.find({ userId: req.user._id })
    .populate("documentId", "title")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: flashcards.length, flashcards });
};

// @desc    Get flashcards for a specific document
// @route   GET /api/v1/flashcards/:docId
const getFlashcardsByDocument = async (req, res) => {
  const flashcards = await Flashcard.find({
    userId: req.user._id,
    documentId: req.params.docId,
  }).sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: flashcards.length, flashcards });
};

// @desc    Toggle favorite on a single card within a set
// @route   PATCH /api/v1/flashcards/:id/favorite
const toggleFavorite = async (req, res) => {
  const { cardIndex } = req.body;

  const flashcardSet = await Flashcard.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!flashcardSet) {
    return res.status(404).json({ success: false, message: "Flashcard set not found." });
  }

  if (cardIndex === undefined || !flashcardSet.cards[cardIndex]) {
    return res.status(400).json({ success: false, message: "Invalid card index." });
  }

  flashcardSet.cards[cardIndex].isFavorite = !flashcardSet.cards[cardIndex].isFavorite;
  flashcardSet.markModified("cards");
  await flashcardSet.save();

  res.status(200).json({ success: true, flashcardSet });
};

// @desc    Delete a flashcard set
// @route   DELETE /api/v1/flashcards/:id
const deleteFlashcardSet = async (req, res) => {
  const flashcardSet = await Flashcard.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!flashcardSet) {
    return res.status(404).json({ success: false, message: "Flashcard set not found." });
  }

  await flashcardSet.deleteOne();
  res.status(200).json({ success: true, message: "Flashcard set deleted." });
};

module.exports = {
  getAllFlashcards,
  getFlashcardsByDocument,
  toggleFavorite,
  deleteFlashcardSet,
};
