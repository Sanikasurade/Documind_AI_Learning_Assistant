import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, ShieldCheck, RefreshCw, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

const OTPPage = () => {
  const [otp, setOtp]           = useState(['', '', '', '', '', ''])
  const [loading, setLoading]   = useState(false)
  const [resending, setResend]  = useState(false)
  const [countdown, setCount]   = useState(60)
  const inputRefs               = useRef([])
  const navigate                = useNavigate()
  const location                = useLocation()
  const { updateUser }          = useAuth()

  // email passed from login page
  const email = location.state?.email
  const type  = location.state?.type || 'login' // 'login' or 'forgot-password'

  // Redirect if no email
  useEffect(() => {
    if (!email) navigate('/login')
  }, [email])

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  // Handle single digit input
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return // only digits
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // only last digit
    setOtp(newOtp)
    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  const handleSubmit = async () => {
    const otpString = otp.join('')
    if (otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP.')
      return
    }

    setLoading(true)
    try {
      if (type === 'login') {
        // Verify login OTP → get JWT
        const res = await api.post('/auth/verify-login-otp', { email, otp: otpString })
        const { token, user } = res.data
        localStorage.setItem('token', token)
        
        // Update React state instead of doing a hard reload
        updateUser(user)
        
        navigate('/dashboard', { replace: true })
        toast.success('Login successful! Welcome back 🎉')
      } else {
        // Verify forgot password OTP → get reset token
        const res = await api.post('/auth/verify-forgot-otp', { email, otp: otpString })
        toast.success('OTP verified!')
        navigate('/reset-password', {
          state: { resetToken: res.data.resetToken, email }
        })
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP.')
      // Clear OTP inputs on error
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResend(true)
    try {
      await api.post('/auth/resend-otp', { email, type })
      toast.success('New OTP sent to your email!')
      setCount(60)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP.')
    } finally {
      setResend(false)
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

          {/* Back button */}
          <button
            onClick={() => navigate(type === 'login' ? '/login' : '/forgot-password')}
            className="flex items-center gap-1.5 text-sm text-[var(--color-muted)]
                       hover:text-[var(--color-text)] transition-colors mb-6"
          >
            <ArrowLeft size={15} /> Back
          </button>

          {/* Icon */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary-500/10 border border-primary-500/20
                            flex items-center justify-center mb-4">
              <ShieldCheck size={28} className="text-primary-500" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
              Verify Your Email
            </h1>
            <p className="text-sm text-[var(--color-muted)] mt-2 text-center">
              We sent a 6-digit OTP to
            </p>
            <p className="text-sm font-semibold text-primary-500 mt-1">{email}</p>
          </div>

          {/* OTP Inputs */}
          <div className="flex gap-3 justify-center mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2
                           bg-[var(--color-bg)] text-[var(--color-text)]
                           focus:outline-none transition-all duration-200
                           ${digit
                             ? 'border-primary-500 bg-primary-500/5'
                             : 'border-[var(--color-border)] focus:border-primary-400'
                           }`}
              />
            ))}
          </div>

          {/* Expiry note */}
          <p className="text-center text-xs text-[var(--color-muted)] mb-6">
            OTP expires in <span className="text-primary-500 font-medium">10 minutes</span>
          </p>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading || otp.join('').length !== 6}
            className="btn-primary w-full justify-center py-3 mb-4
                       disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ShieldCheck size={16} />
                {type === 'login' ? 'Verify & Login' : 'Verify OTP'}
              </span>
            )}
          </button>

          {/* Resend */}
          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-sm text-[var(--color-muted)]">
                Resend OTP in{' '}
                <span className="text-primary-500 font-medium">{countdown}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="flex items-center gap-1.5 text-sm text-primary-500
                           hover:text-primary-400 transition-colors mx-auto
                           disabled:opacity-60"
              >
                <RefreshCw size={13} className={resending ? 'animate-spin' : ''} />
                {resending ? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default OTPPage
