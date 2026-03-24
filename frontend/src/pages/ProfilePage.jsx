import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Save, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
  })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)
  const [loading, setLoading]         = useState(false)

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (form.newPassword && !passRegex.test(form.newPassword)) {
      toast.error('New password must be at least 8 chars long and include uppercase, lowercase, number, and special character.')
      return
    }
    setLoading(true)
    try {
      const payload = { name: form.name, email: form.email }
      if (form.newPassword) {
        payload.currentPassword = form.currentPassword
        payload.newPassword     = form.newPassword
      }
      const res = await authService.updateProfile(payload)
      updateUser(res.data.user)
      setForm(prev => ({ ...prev, currentPassword: '', newPassword: '' }))
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container py-8 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-8"
            style={{ fontFamily: "'Clash Display', sans-serif" }}>
          Profile Settings
        </h1>

        {/* Avatar */}
        <div className="card mb-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center
                          justify-center text-white text-2xl font-bold shadow-lg shadow-primary-500/30">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-[var(--color-text)]">{user?.name}</p>
            <p className="text-sm text-[var(--color-muted)]">{user?.email}</p>
          </div>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="font-semibold text-[var(--color-text)] border-b
                           border-[var(--color-border)] pb-4">
              Account Information
            </h2>

            {/* Name */}
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2
                                           text-[var(--color-muted)]" />
                <input name="name" value={form.name} onChange={handleChange}
                  className="input pl-10" placeholder="Your name" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2
                                           text-[var(--color-muted)]" />
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  className="input pl-10" placeholder="your@email.com" />
              </div>
            </div>

            {/* Divider */}
            <h2 className="font-semibold text-[var(--color-text)] border-b
                           border-[var(--color-border)] pb-4 pt-2">
              Change Password <span className="text-xs font-normal text-[var(--color-muted)]">(optional)</span>
            </h2>

            {/* Current password */}
            <div>
              <label className="label">Current Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2
                                           text-[var(--color-muted)]" />
                <input name="currentPassword" type={showCurrent ? 'text' : 'password'}
                  value={form.currentPassword} onChange={handleChange}
                  className="input pl-10 pr-10" placeholder="Enter current password" />
                <button type="button" onClick={() => setShowCurrent(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-[var(--color-muted)] hover:text-[var(--color-text)]">
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2
                                           text-[var(--color-muted)]" />
                <input name="newPassword" type={showNew ? 'text' : 'password'}
                  value={form.newPassword} onChange={handleChange}
                  className="input pl-10 pr-10" placeholder="Strong password" />
                <button type="button" onClick={() => setShowNew(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-[var(--color-muted)] hover:text-[var(--color-text)]">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed
                         disabled:hover:scale-100">
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2"><Save size={16} /> Save Changes</span>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default ProfilePage
