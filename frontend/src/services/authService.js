import api from './api'

export const authService = {
  signup: (data) => api.post('/auth/signup', data),
  login:  (data) => api.post('/auth/login', data),
  getMe:  ()     => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data),
  updateAvatar:  (data) => api.put('/auth/update-avatar',  data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}
