import api from './api'

export const quizService = {
  getByDocument: (docId)          => api.get(`/quizzes/document/${docId}`),
  getById:       (id)             => api.get(`/quizzes/${id}`),
  submit:        (id, answers, timeTaken) =>
    api.post(`/quizzes/${id}/submit`, { answers, timeTaken }),
  getResult:     (id)             => api.get(`/quizzes/${id}/result`),
}
