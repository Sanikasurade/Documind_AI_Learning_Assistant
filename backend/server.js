require("dotenv").config();
require("express-async-errors");

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const { initGemini } = require("./config/gemini");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

// Route imports
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const aiRoutes = require("./routes/aiRoutes");
const flashcardRoutes = require("./routes/flashcardRoutes");
const quizRoutes = require("./routes/quizRoutes");

const app = express();

// ─── Middleware ──────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded PDFs statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Health Check ────────────────────────────────────────────────────────────

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "StudyGenie API is running 🚀",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/documents", documentRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/flashcards", flashcardRoutes);
app.use("/api/v1/quizzes", quizRoutes);

// ─── Error Handling ──────────────────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

// ─── Bootstrap ───────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  initGemini();

  app.listen(PORT, () => {
    console.log("\n=======================================");
    console.log(`🚀 StudyGenie AI Server running`);
    console.log(`📡 Port     : ${PORT}`);
    console.log(`🌍 Env      : ${process.env.NODE_ENV || "development"}`);
    console.log(`🔗 Health   : http://localhost:${PORT}/api/v1/health`);
    console.log("=======================================\n");
  });
};

startServer();

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("🔴 Unhandled Rejection:", err.message);
  process.exit(1);
});
