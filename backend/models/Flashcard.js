const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  answer: {
    type: String,
    required: true,
    trim: true,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
});

const flashcardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    setName: {
      type: String,
      required: true,
      trim: true,
    },
    cards: {
      type: [cardSchema],
      validate: {
        validator: (cards) => cards.length > 0,
        message: "Flashcard set must have at least one card",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Flashcard", flashcardSchema);
