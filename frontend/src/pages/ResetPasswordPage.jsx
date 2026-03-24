import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, CheckCircle, ArrowRight } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const ResetPasswordPage = () => {
  const [form, setForm]         = useState({ newPassword: '', confirmPassword: '' })
  const [showNew, setShowNew]   = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const navigate                = useNavigate()
  const location                = useLocation()

  // resetToken is passed from OTPPage after verifying the forgot-password OTP
  const resetToken = location.state?.resetToken
  const email      = location.state?.email

  useEffect(() => {
    if (!resetToken) navigate('/forgot-password')
  }, [resetToken])

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passRegex.test(form.newPassword)) {
      toast.error('Password must be at least 8 chars long and include uppercase, lowercase, number, and special character.')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      // Token is in the URL param as per the backend route POST /auth/reset-password/:token
      await api.post(`/auth/reset-password/${resetToken}`, {
        password: form.newPassword,
      })
      setSuccess(true)
      toast.success('Password reset successfully!')
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (success) return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center max-w-sm"
      >
        <div className="w-20 h-20 rounded-full bg-primary-500/10 border-2 border-primary-500
                        flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-primary-500" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-3">Password Reset!</h2>
        <p className="text-[var(--color-muted)] mb-6">
          Your password has been updated. Redirecting to login…
        </p>
        <Link to="/login" className="btn-primary mx-auto">Go to Login</Link>
      </motion.div>
    </div>
  )

  // ── Form ──────────────────────────────────────────────────────────────────
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

          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/10 border border-primary-500/20
                            flex items-center justify-center mb-4">
              <Lock size={24} className="text-primary-500" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">Set New Password</h1>
            <p className="text-sm text-[var(--color-muted)] mt-2 text-center">
              {email
                ? <>Creating a new password for <span className="text-primary-500 font-medium">{email}</span></>
                : 'Create a strong new password for your account.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* New password */}
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                <input
                  name="newPassword"
                  type={showNew ? 'text' : 'password'}
                  value={form.newPassword}
                  onChange={handleChange}
                  placeholder="Strong password"
                  className="input pl-10 pr-10"
                  required
                />
                <button type="button" onClick={() => setShowNew(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-[var(--color-muted)] hover:text-[var(--color-text)]">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength bar */}
              {form.newPassword && (
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                      form.newPassword.length >= i * 4
                        ? i === 1 ? 'bg-red-400' : i === 2 ? 'bg-yellow-400' : 'bg-primary-500'
                        : 'bg-[var(--color-border)]'
                    }`} />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                <input
                  name="confirmPassword"
                  type={showConf ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat new password"
                  className="input pl-10 pr-10"
                  required
                />
                <button type="button" onClick={() => setShowConf(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-[var(--color-muted)] hover:text-[var(--color-text)]">
                  {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.confirmPassword && (
                <p className={`text-xs mt-1 ${
                  form.newPassword === form.confirmPassword ? 'text-primary-500' : 'text-red-400'
                }`}>
                  {form.newPassword === form.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3
                         disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Resetting…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Reset Password <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default ResetPasswordPage
