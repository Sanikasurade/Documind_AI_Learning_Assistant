import api from './api'

export const flashcardService = {
  getAll:         ()        => api.get('/flashcards'),
  getByDocument:  (docId)   => api.get(`/flashcards/${docId}`),
  toggleFavorite: (id, cardIndex) => api.patch(`/flashcards/${id}/favorite`, { cardIndex }),
  deleteSet:      (id)      => api.delete(`/flashcards/${id}`),
}
