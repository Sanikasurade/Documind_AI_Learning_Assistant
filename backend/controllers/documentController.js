const Document = require("../models/Document");
const { extractTextFromPDF } = require("../services/pdfService");
const fs = require("fs");
const path = require("path");

// @desc    Upload PDF document
// @route   POST /api/v1/documents/upload
// @access  Private
const uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded." });
  }

  const { title } = req.body;
  const { filename, path: filePath, size } = req.file;

  // Extract text from PDF
  const extractedText = await extractTextFromPDF(filePath);

  if (!extractedText || extractedText.trim().length === 0) {
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    return res.status(422).json({
      success: false,
      message: "Could not extract text from PDF. Ensure it is not a scanned image.",
    });
  }

  const document = await Document.create({
    userId: req.user._id,
    title: title || path.basename(req.file.originalname, ".pdf"),
    fileName: filename,
    filePath,
    fileSize: size,
    extractedText,
  });

  res.status(201).json({ success: true, document });
};

// @desc    Get all documents for user
// @route   GET /api/v1/documents
// @access  Private
const getDocuments = async (req, res) => {
  const documents = await Document.find({ userId: req.user._id })
    .select("-extractedText")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: documents.length, documents });
};

// @desc    Get single document
// @route   GET /api/v1/documents/:id
// @access  Private
const getDocument = async (req, res) => {
  const document = await Document.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!document) {
    return res.status(404).json({ success: false, message: "Document not found." });
  }

  res.status(200).json({ success: true, document });
};

// @desc    Delete document
// @route   DELETE /api/v1/documents/:id
// @access  Private
const deleteDocument = async (req, res) => {
  const document = await Document.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!document) {
    return res.status(404).json({ success: false, message: "Document not found." });
  }

  // Remove file from disk
  if (fs.existsSync(document.filePath)) {
    fs.unlinkSync(document.filePath);
  }

  await document.deleteOne();

  res.status(200).json({ success: true, message: "Document deleted successfully." });
};

module.exports = { uploadDocument, getDocuments, getDocument, deleteDocument };
