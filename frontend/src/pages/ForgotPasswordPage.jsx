import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Mail, ArrowLeft, ArrowRight } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const ForgotPasswordPage = () => {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const navigate              = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Please enter your email address.')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      toast.success('OTP sent! Check your email.')
      navigate('/verify-otp', {
        state: { email, type: 'forgot-password' }
      })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                      w-96 h-96 bg-primary-500/8 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="card border-[var(--color-border)] shadow-2xl shadow-black/10 p-8">

          {/* Back */}
          <Link to="/login"
            className="flex items-center gap-1.5 text-sm text-[var(--color-muted)]
                       hover:text-[var(--color-text)] transition-colors mb-6">
            <ArrowLeft size={15} /> Back to Login
          </Link>

          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary-500 flex items-center
                            justify-center mb-4 shadow-lg shadow-primary-500/30">
              <Brain size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">Forgot Password?</h1>
            <p className="text-sm text-[var(--color-muted)] mt-2 text-center">
              Enter your email and we'll send you an OTP to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2
                                           text-[var(--color-muted)]" />
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input pl-10" required
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3
                         disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending OTP...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Send OTP <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--color-muted)] mt-6">
            Remember your password?{' '}
            <Link to="/login" className="text-primary-500 hover:text-primary-400 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default ForgotPasswordPage
