import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Phone, GraduationCap, Target, FileText, Save } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    institution: user?.institution || '',
    learningGoal: user?.learningGoal || '',
    bio: user?.bio || '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Name is required.')
      return
    }
    setLoading(true)
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        institution: form.institution,
        learningGoal: form.learningGoal,
        bio: form.bio,
      }
      const res = await authService.updateProfile(payload)
      updateUser(res.data.user)
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

        {/* Avatar & Info */}
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
              Personal Information
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

            {/* Phone */}
            <div>
              <label className="label">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2
                                           text-[var(--color-muted)]" />
                <input name="phone" value={form.phone} onChange={handleChange}
                  className="input pl-10" placeholder="e.g. +91 9876543210" />
              </div>
            </div>

            {/* Institution */}
            <div>
              <label className="label">Institution / Organization</label>
              <div className="relative">
                <GraduationCap size={16} className="absolute left-3 top-1/2 -translate-y-1/2
                                           text-[var(--color-muted)]" />
                <input name="institution" value={form.institution} onChange={handleChange}
                  className="input pl-10" placeholder="e.g. MIT, Stanford University" />
              </div>
            </div>

            {/* Divider */}
            <h2 className="font-semibold text-[var(--color-text)] border-b
                           border-[var(--color-border)] pb-4 pt-2">
              Learning Profile
            </h2>

            {/* Learning Goal */}
            <div>
              <label className="label">Learning Goal</label>
              <div className="relative">
                <Target size={16} className="absolute left-3 top-3
                                           text-[var(--color-muted)]" />
                <input name="learningGoal" value={form.learningGoal} onChange={handleChange}
                  className="input pl-10" placeholder="e.g. Master Machine Learning fundamentals" />
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-1">What are you currently focused on learning?</p>
            </div>

            {/* Bio */}
            <div>
              <label className="label">Bio</label>
              <div className="relative">
                <FileText size={16} className="absolute left-3 top-3
                                           text-[var(--color-muted)]" />
                <textarea name="bio" value={form.bio} onChange={handleChange}
                  rows={3}
                  className="input pl-10 resize-none" placeholder="Tell us a little about yourself..." />
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-1">{form.bio.length}/300 characters</p>
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
