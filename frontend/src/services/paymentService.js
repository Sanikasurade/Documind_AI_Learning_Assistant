import api from './api'

const paymentService = {
  // Get current user's active plan
  getPlan: () => api.get('/payments/plan'),

  // Create a Razorpay order for the chosen plan
  createOrder: (planType) => api.post('/payments/create-order', { planType }),

  // Verify payment after Razorpay checkout succeeds
  verifyPayment: (data) => api.post('/payments/verify', data),
}

export default paymentService
