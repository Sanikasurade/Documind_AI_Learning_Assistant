import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileText, BookOpen, BarChart3, Trash2,
  Plus, X, Brain, Calendar
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { documentService } from '../services/documentService'
import Loader from '../components/common/Loader'
import toast from 'react-hot-toast'

// ── Stats Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="card"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-[var(--color-muted)] mb-1">{label}</p>
        <p className="text-3xl font-bold text-[var(--color-text)]"
          style={{ fontFamily: "'Clash Display', sans-serif" }}>{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon size={22} />
      </div>
    </div>
  </motion.div>
)

// ── Document Card ─────────────────────────────────────────────────────────────
const DocumentCard = ({ doc, onDelete }) => {
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm('Delete this document? This cannot be undone.')) return
    setDeleting(true)
    try {
      await documentService.deleteDoc(doc._id)
      onDelete(doc._id)
      toast.success('Document deleted.')
    } catch {
      toast.error('Failed to delete document.')
      setDeleting(false)
    }
  }

  const formatSize = (bytes) => {
    const kb = bytes / 1024
    return kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(1)} MB`
  }

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => navigate(`/document/${doc._id}`)}
      className="card-hover group relative"
    >
      {/* Delete button */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="absolute top-4 right-4 w-8 h-8 rounded-lg
                   opacity-0 group-hover:opacity-100 transition-all duration-200
                   flex items-center justify-center
                   text-[var(--color-muted)] hover:text-red-400 hover:bg-red-400/10"
      >
        {deleting
          ? <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
          : <Trash2 size={14} />
        }
      </button>

      {/* Icon */}
      <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center
                      justify-center mb-4 group-hover:bg-primary-500/20 transition-colors">
        <FileText size={20} className="text-primary-500" />
      </div>

      {/* Title */}
      <h3 className="font-semibold text-[var(--color-text)] mb-1 pr-8 line-clamp-1">
        {doc.title}
      </h3>

      {/* Meta */}
      <p className="text-xs text-[var(--color-muted)] mb-4">{formatSize(doc.fileSize)}</p>

      {/* Stats */}
      <div className="flex items-center gap-3 mb-4">
        <span className="flex items-center gap-1 text-xs text-[var(--color-muted)]">
          <BookOpen size={12} className="text-primary-500" />
          {doc.flashcardCount || 0} Flashcard sets
        </span>
        <span className="flex items-center gap-1 text-xs text-[var(--color-muted)]">
          <BarChart3 size={12} className="text-purple-500" />
          {doc.quizCount || 0} Quizzes
        </span>
      </div>

      {/* Date */}
      <div className="flex items-center gap-1 text-xs text-[var(--color-muted)]
                      pt-4 border-t border-[var(--color-border)]">
        <Calendar size={11} />
        {formatDate(doc.createdAt)}
      </div>
    </motion.div>
  )
}

// ── Upload Modal ──────────────────────────────────────────────────────────────
const UploadModal = ({ onClose, onUpload }) => {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [dragging, setDrag] = useState(false)
  const [uploading, setUpl] = useState(false)
  const [progress, setProg] = useState(0)

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false)
    const f = e.dataTransfer.files[0]
    if (f?.type === 'application/pdf') { setFile(f); setTitle(f.name.replace('.pdf', '')) }
    else toast.error('Only PDF files are allowed.')
  }

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (f) { setFile(f); setTitle(f.name.replace('.pdf', '')) }
  }

  const handleSubmit = async () => {
    if (!file) { toast.error('Please select a PDF.'); return }
    if (!title.trim()) { toast.error('Please enter a title.'); return }

    setUpl(true)
    const interval = setInterval(() => setProg(p => Math.min(p + 10, 85)), 300)

    try {
      const fd = new FormData()
      fd.append('pdf', file)
      fd.append('title', title.trim())
      const res = await documentService.upload(fd)
      clearInterval(interval); setProg(100)
      setTimeout(() => {
        onUpload(res.data.document)
        onClose()
        toast.success('Document uploaded and processed! 🎉')
      }, 400)
    } catch (err) {
      clearInterval(interval)
      toast.error(err.response?.data?.message || 'Upload failed.')
      setUpl(false); setProg(0)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4
                 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-[var(--color-bg)] border border-[var(--color-border)]
                   rounded-3xl p-8 w-full max-w-lg shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[var(--color-text)]">Upload Document</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center
                       text-[var(--color-muted)] hover:bg-[var(--color-surface)]">
            <X size={18} />
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('pdf-input').click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
                      transition-all duration-200 mb-6
                      ${dragging
              ? 'border-primary-500 bg-primary-500/10'
              : file
                ? 'border-primary-500/50 bg-primary-500/5'
                : 'border-[var(--color-border)] hover:border-primary-400 hover:bg-[var(--color-surface)]'
            }`}
        >
          <input id="pdf-input" type="file" accept=".pdf" className="hidden" onChange={handleFile} />
          {file ? (
            <div>
              <FileText size={36} className="text-primary-500 mx-auto mb-2" />
              <p className="font-medium text-[var(--color-text)]">{file.name}</p>
              <p className="text-sm text-[var(--color-muted)]">
                {(file.size / 1024).toFixed(0)} KB
              </p>
            </div>
          ) : (
            <div>
              <Upload size={36} className="text-[var(--color-muted)] mx-auto mb-3" />
              <p className="font-medium text-[var(--color-text)] mb-1">
                Drop your PDF here
              </p>
              <p className="text-sm text-[var(--color-muted)]">or click to browse • Max 20MB</p>
            </div>
          )}
        </div>

        {/* Title input */}
        <div className="mb-6">
          <label className="label">Document Title</label>
          <input
            value={title} onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Machine Learning Chapter 3"
            className="input"
          />
        </div>

        {/* Progress */}
        {uploading && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-[var(--color-muted)] mb-1">
              <span>Processing PDF...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary-500 rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={uploading || !file}
          className="btn-primary w-full justify-center py-3
                     disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {uploading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Uploading & Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Upload size={16} /> Upload & Process
            </span>
          )}
        </button>
      </motion.div>
    </motion.div>
  )
}

// ── Dashboard Page ────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const { user } = useAuth()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await documentService.getAll()
      setDocuments(res.data.documents)
    } catch {
      toast.error('Failed to load documents.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDocuments() }, [fetchDocuments])

  const totalFlashcards = documents.reduce((s, d) => s + (d.flashcardCount || 0), 0)
  const totalQuizzes = documents.reduce((s, d) => s + (d.quizCount || 0), 0)

  const handleUpload = (doc) => setDocuments(prev => [doc, ...prev])
  const handleDelete = (id) => setDocuments(prev => prev.filter(d => d._id !== id))

  return (
    <div className="page-container py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]"
            style={{ fontFamily: "'Clash Display', sans-serif" }}>
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
            <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-[var(--color-muted)] mt-1">Your learning hub — let's get started.</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="btn-primary">
          <Plus size={18} /> Upload PDF
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard icon={FileText} label="Documents" value={documents.length} color="bg-blue-500/10 text-blue-500" delay={0.1} />
        <StatCard icon={BookOpen} label="Flashcard Sets" value={totalFlashcards} color="bg-primary-500/10 text-primary-500" delay={0.2} />
        <StatCard icon={BarChart3} label="Quizzes" value={totalQuizzes} color="bg-purple-500/10 text-purple-500" delay={0.3} />
      </div>

      {/* Documents */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">Your Documents</h2>
        <span className="text-sm text-[var(--color-muted)]">{documents.length} total</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader size="lg" text="Loading documents..." /></div>
      ) : documents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 card"
        >
          <Brain size={48} className="text-[var(--color-border)] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">No documents yet</h3>
          <p className="text-[var(--color-muted)] mb-6 text-sm">
            Upload your first PDF to start learning with AI
          </p>
          <button onClick={() => setShowUpload(true)} className="btn-primary mx-auto">
            <Upload size={16} /> Upload Your First PDF
          </button>
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {documents.map(doc => (
              <DocumentCard key={doc._id} doc={doc} onDelete={handleDelete} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <UploadModal onClose={() => setShowUpload(false)} onUpload={handleUpload} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default DashboardPage
