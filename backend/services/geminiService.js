const { getModel } = require("../config/gemini");
const { truncateForAI } = require("./pdfService");

/**
 * Parse JSON safely from Gemini response text.
 * Gemini sometimes wraps JSON in markdown code fences.
 */
const parseJSON = (text) => {
  // Strip markdown code fences if present
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  return JSON.parse(cleaned);
};

/**
 * Chat with a document — answers questions using only document content.
 */
const chat = async (documentText, question, chatHistory = []) => {
  const model = getModel();
  const context = truncateForAI(documentText);

  const systemPrompt = `You are an intelligent study assistant. You ONLY answer questions based on the document content provided below. 
If the question cannot be answered from the document, say "I couldn't find information about that in this document."
Be concise, clear, and educational in your responses.

DOCUMENT CONTENT:
${context}`;

  // Build conversation history for multi-turn chat
  const historyMessages = chatHistory.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({
    history: [
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: "Understood. I'll answer questions exclusively based on the provided document." }] },
      ...historyMessages,
    ],
  });

  const result = await chat.sendMessage(question);
  return result.response.text();
};

/**
 * Generate a concise summary of the document.
 */
const summarize = async (documentText) => {
  const model = getModel();
  const context = truncateForAI(documentText);

  const prompt = `You are an expert academic summarizer. Create a well-structured summary of the following document.

Format your response with:
1. **Overview** (2-3 sentences)
2. **Key Topics** (bullet points)
3. **Main Takeaways** (3-5 key points)
4. **Important Terms** (list key terms with brief definitions)

DOCUMENT:
${context}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

/**
 * Explain a concept using the document as context.
 */
const explain = async (documentText, concept) => {
  const model = getModel();
  const context = truncateForAI(documentText);

  const prompt = `Using ONLY the information from the document below, explain the concept of "${concept}".

If the concept isn't directly covered in the document, use related information from the document to provide context, and note what you're doing.

Structure your explanation:
1. **Definition** (what is it)
2. **How it works** (mechanism/process)
3. **Key characteristics**
4. **Examples from the document** (if any)

DOCUMENT:
${context}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

/**
 * Generate flashcard pairs from document content.
 * Returns array of { question, answer } objects.
 */
const generateFlashcards = async (documentText) => {
  const model = getModel();
  const context = truncateForAI(documentText, 80000);

  const prompt = `You are an expert educator. Analyze the following document and create high-quality flashcards.

Generate 15-20 flashcard pairs covering:
- Key terms and their definitions
- Important concepts and explanations
- Cause-and-effect relationships
- Formulas or rules (if applicable)
- Important facts

Return ONLY a valid JSON array (no markdown, no extra text):
[
  {
    "question": "What is [term]?",
    "answer": "Clear, concise answer from the document"
  }
]

DOCUMENT:
${context}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const cards = parseJSON(text);

  if (!Array.isArray(cards)) throw new Error("AI returned invalid flashcard format.");

  return cards.map((card) => ({
    question: card.question,
    answer: card.answer,
    isFavorite: false,
  }));
};

/**
 * Generate MCQ quiz questions from document content.
 * Returns array of { question, options, correctAnswer, explanation }.
 */
const generateQuiz = async (documentText, numQuestions = 10) => {
  const model = getModel();
  const context = truncateForAI(documentText, 80000);

  const count = Math.min(Math.max(numQuestions, 3), 20); // clamp 3-20

  const prompt = `You are an expert quiz creator. Generate ${count} multiple-choice questions from the document below.

Requirements:
- Each question must have exactly 4 options labeled A, B, C, D
- Only one option should be correct
- Difficulty should be moderate to challenging
- Questions should test understanding, not just memorization
- Explanations should reference the document content

Return ONLY a valid JSON array (no markdown, no extra text):
[
  {
    "question": "Question text here?",
    "options": {
      "A": "First option",
      "B": "Second option",
      "C": "Third option",
      "D": "Fourth option"
    },
    "correctAnswer": "A",
    "explanation": "Brief explanation of why this is correct, referencing the document."
  }
]

DOCUMENT:
${context}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const questions = parseJSON(text);

  if (!Array.isArray(questions)) throw new Error("AI returned invalid quiz format.");

  return questions.slice(0, count).map((q) => ({
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
  }));
};

module.exports = { chat, summarize, explain, generateFlashcards, generateQuiz };