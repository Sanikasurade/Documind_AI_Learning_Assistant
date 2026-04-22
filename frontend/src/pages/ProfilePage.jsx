import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Phone, GraduationCap, Target, FileText, Save, Camera, Upload, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

const IMAGE_BASE_URL = 'http://localhost:5000/uploads/'

const ProfilePage = () => {
  const { user, updateUser } = useAuth()
  const fileInputRef = useRef(null)
  
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    institution: user?.institution || '',
    learningGoal: user?.learningGoal || '',
    bio: user?.bio || '',
  })
  
  const [loading, setLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleAvatarUpload = async (file) => {
    if (!file) return
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and WEBP images are allowed.')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB.')
      return
    }

    setAvatarLoading(true)
    const formData = new FormData()
    formData.append('avatar', file)

    try {
      const res = await authService.updateAvatar(formData)
      updateUser(res.data.user)
      toast.success('Profile picture updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image.')
    } finally {
      setAvatarLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) handleAvatarUpload(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleAvatarUpload(file)
  }

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

        {/* Avatar & Info Section */}
        <div className="card mb-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Drag & Drop Avatar */}
            <div 
              className={`relative group cursor-pointer w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden
                         border-2 transition-all duration-300 flex items-center justify-center
                         ${isDragging ? 'border-primary-500 scale-105 bg-primary-500/10' : 'border-transparent bg-[var(--color-surface)]'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarLoading ? (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              ) : null}

              <AnimatePresence mode="wait">
                {user?.profilePicture ? (
                  <motion.img 
                    key="avatar"
                    src={`${IMAGE_BASE_URL}${user.profilePicture}`} 
                    alt={user.name}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                ) : (
                  <motion.div 
                    key="initial"
                    className="w-full h-full bg-primary-500 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Overlay */}
              <div className={`absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white
                              opacity-0 group-hover:opacity-100 transition-opacity duration-300
                              ${isDragging ? 'opacity-100' : ''}`}>
                <Camera size={24} className="mb-1" />
                <span className="text-[10px] font-medium uppercase tracking-wider">Change</span>
              </div>

              {/* Drop Zone Indicator */}
              {isDragging && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-primary-500/20 backdrop-blur-[2px]">
                  <Upload size={32} className="text-primary-500 animate-bounce" />
                </div>
              )}
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/jpeg,image/png,image/webp"
            />

            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">{user?.name}</h2>
              <p className="text-[var(--color-muted)] mb-3">{user?.email}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <span className="px-3 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full text-xs text-[var(--color-muted)]">
                  Student
                </span>
                <span className="px-3 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full text-xs text-[var(--color-muted)]">
                  {user?.institution || 'No Institution Set'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-primary-500/5 border border-primary-500/10 rounded-2xl">
            <p className="text-xs text-primary-600 font-medium flex items-center gap-2">
              <Upload size={14} />
              Tip: Drag and drop a new photo directly onto your avatar to update it.
            </p>
          </div>
        </div>

        {/* Form Section */}
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
              className="btn-primary w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed
                         disabled:hover:scale-100 px-8">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
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
