import api from './api'

export const documentService = {
  upload: (formData) =>
    api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll:    ()   => api.get('/documents'),
  getById:   (id) => api.get(`/documents/${id}`),
  deleteDoc: (id) => api.delete(`/documents/${id}`),
}
