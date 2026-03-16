const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI = null;
let model = null;

const initGemini = () => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️  GEMINI_API_KEY not set. AI features will be unavailable.");
    return;
  }

  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    console.log("✅ Gemini AI initialized");
  } catch (error) {
    console.error(`❌ Gemini initialization failed: ${error.message}`);
  }
};

const getModel = () => {
  if (!model) {
    throw new Error("Gemini AI is not initialized. Check your GEMINI_API_KEY.");
  }
  return model;
};

module.exports = { initGemini, getModel };
