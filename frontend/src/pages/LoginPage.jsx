import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      if (res.data.requiresOTP) {
        toast.success('OTP sent to your email!')
        navigate('/verify-otp', {
          state: { email: form.email, type: 'login', from }
        })
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.')
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
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="card border-[var(--color-border)] shadow-2xl shadow-black/10 p-8">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary-500 flex items-center
                            justify-center mb-4 shadow-lg shadow-primary-500/30">
              <Brain size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">Welcome back</h1>
            <p className="text-sm text-[var(--color-muted)] mt-1">
              Sign in — we'll verify with an OTP
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2
                                           text-[var(--color-muted)]" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary-500 hover:text-primary-400
                             font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2
                                           text-[var(--color-muted)]" />
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-[var(--color-muted)] hover:text-[var(--color-text)]
                             transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 mt-2
                         disabled:opacity-60 disabled:cursor-not-allowed
                         disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white
                                  rounded-full animate-spin" />
                  Sending OTP...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Continue <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          {/* Sign up link */}
          <p className="text-center text-sm text-[var(--color-muted)] mt-6">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-primary-500 hover:text-primary-400
                         font-medium transition-colors"
            >
              Create one free
            </Link>
          </p>

        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage