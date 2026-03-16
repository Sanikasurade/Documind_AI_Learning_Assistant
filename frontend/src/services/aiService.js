import api from './api'

export const aiService = {
  chat:               (documentId, question, chatHistory) =>
    api.post('/ai/chat', { documentId, question, chatHistory }),

  generateSummary:    (documentId) =>
    api.post('/ai/summary', { documentId }),

  explainConcept:     (documentId, concept) =>
    api.post('/ai/explain', { documentId, concept }),

  generateFlashcards: (documentId, setName) =>
    api.post('/ai/flashcards', { documentId, setName }),

  generateQuiz:       (documentId, numQuestions, quizTitle) =>
    api.post('/ai/quiz', { documentId, numQuestions, quizTitle }),
}
