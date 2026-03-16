const fs = require("fs");

/**
 * Extract plain text from a PDF file using pdf-parse.
 * Returns the extracted string or throws on failure.
 */
const extractTextFromPDF = async (filePath) => {
  try {
    // Dynamically require pdf-parse to avoid test-file issues on import
    const pdfParse = require("pdf-parse");

    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    // Normalize whitespace
    const text = data.text
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    console.log(`📄 Extracted ${text.length} characters from PDF`);
    return text;
  } catch (error) {
    console.error("❌ PDF extraction error:", error.message);
    throw new Error(`PDF text extraction failed: ${error.message}`);
  }
};

/**
 * Truncate document text to stay within Gemini token limits.
 * Gemini 1.5 Flash supports ~1M tokens; keeping well under to be safe.
 */
const truncateForAI = (text, maxChars = 120000) => {
  if (text.length <= maxChars) return text;
  console.warn(`⚠️  Document text truncated from ${text.length} to ${maxChars} chars`);
  return text.slice(0, maxChars) + "\n\n[... document truncated for processing ...]";
};

module.exports = { extractTextFromPDF, truncateForAI };
