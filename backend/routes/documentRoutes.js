const express = require("express");
const router = express.Router();
const {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
} = require("../controllers/documentController");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");

// All routes are protected
router.use(protect);

// @route  POST /api/v1/documents/upload
router.post("/upload", upload.single("pdf"), uploadDocument);

// @route  GET /api/v1/documents
router.get("/", getDocuments);

// @route  GET /api/v1/documents/:id
router.get("/:id", getDocument);

// @route  DELETE /api/v1/documents/:id
router.delete("/:id", deleteDocument);

module.exports = router;
