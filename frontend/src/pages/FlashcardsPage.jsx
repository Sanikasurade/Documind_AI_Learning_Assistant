import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Star, Trash2, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import { flashcardService } from '../services/flashcardService'
import Loader from '../components/common/Loader'
import toast from 'react-hot-toast'

// ── Flip Card ─────────────────────────────────────────────────────────────────
const FlipCard = ({ card, index, onFavorite, isFav }) => {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      onClick={() => setFlipped(p => !p)}
      className="cursor-pointer"
      style={{ perspective: 1000, height: 200 }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 80 }}
        style={{ transformStyle: 'preserve-3d', position: 'relative', height: '100%' }}
      >
        {/* Front */}
        <div style={{ backfaceVisibility: 'hidden' }}
          className="absolute inset-0 card flex flex-col justify-between p-5 rounded-2xl
                     border border-[var(--color-border)]">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-medium text-primary-500 badge">Question</span>
            <button
              onClick={e => { e.stopPropagation(); onFavorite(index) }}
              className={`transition-colors ${isFav ? 'text-yellow-400' : 'text-[var(--color-muted)] hover:text-yellow-400'}`}
            >
              <Star size={14} fill={isFav ? 'currentColor' : 'none'} />
            </button>
          </div>
          <p className="text-sm font-medium text-[var(--color-text)] leading-relaxed">
            {card.question}
          </p>
          <p className="text-xs text-[var(--color-muted)]">Click to reveal answer</p>
        </div>

        {/* Back */}
        <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          className="absolute inset-0 bg-primary-500/10 border border-primary-500/30
                     rounded-2xl flex flex-col justify-between p-5">
          <span className="text-xs font-medium text-primary-500 badge self-start">Answer</span>
          <p className="text-sm text-[var(--color-text)] leading-relaxed">{card.answer}</p>
          <p className="text-xs text-primary-500">Click to flip back</p>
        </div>
      </motion.div>
    </div>
  )
}

// ── Flashcard Set ─────────────────────────────────────────────────────────────
const FlashcardSet = ({ set, onDelete, onFavorite }) => {
  const [currentIdx, setCurrentIdx] = useState(0)
  const card = set.cards[currentIdx]

  return (
    <div className="card mb-6">
      {/* Set header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-[var(--color-text)]">{set.setName}</h3>
          <p className="text-xs text-[var(--color-muted)] mt-0.5">
            {set.documentId?.title || 'Document'} · {set.cards.length} cards
          </p>
        </div>
        <button
          onClick={() => onDelete(set._id)}
          className="w-8 h-8 rounded-lg flex items-center justify-center
                     text-[var(--color-muted)] hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Card */}
      <FlipCard
        card={card}
        index={currentIdx}
        isFav={card.isFavorite}
        onFavorite={(i) => onFavorite(set._id, i)}
      />

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4">
        <button
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx(p => p - 1)}
          className="flex items-center gap-1 text-sm text-[var(--color-muted)]
                     disabled:opacity-30 hover:text-[var(--color-text)] transition-colors"
        >
          <ChevronLeft size={16} /> Prev
        </button>
        <span className="text-xs text-[var(--color-muted)]">
          {currentIdx + 1} / {set.cards.length}
        </span>
        <button
          disabled={currentIdx === set.cards.length - 1}
          onClick={() => setCurrentIdx(p => p + 1)}
          className="flex items-center gap-1 text-sm text-[var(--color-muted)]
                     disabled:opacity-30 hover:text-[var(--color-text)] transition-colors"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
const FlashcardsPage = () => {
  const [sets, setSets]     = useState([])
  const [loading, setLoad]  = useState(true)

  useEffect(() => {
    flashcardService.getAll()
      .then(r => setSets(r.data.flashcards))
      .catch(() => toast.error('Failed to load flashcards.'))
      .finally(() => setLoad(false))
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this flashcard set?')) return
    try {
      await flashcardService.deleteSet(id)
      setSets(prev => prev.filter(s => s._id !== id))
      toast.success('Flashcard set deleted.')
    } catch {
      toast.error('Failed to delete.')
    }
  }

  const handleFavorite = async (setId, cardIndex) => {
    try {
      const res = await flashcardService.toggleFavorite(setId, cardIndex)
      setSets(prev => prev.map(s => s._id === setId ? res.data.flashcardSet : s))
    } catch {
      toast.error('Failed to update favorite.')
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Loader size="lg" text="Loading flashcards..." />
    </div>
  )

  return (
    <div className="page-container py-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
            <BookOpen size={20} className="text-primary-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]"
                style={{ fontFamily: "'Clash Display', sans-serif" }}>
              All Flashcards
            </h1>
            <p className="text-sm text-[var(--color-muted)]">{sets.length} sets across all documents</p>
          </div>
        </div>

        {sets.length === 0 ? (
          <div className="text-center py-20 card">
            <BookOpen size={48} className="text-[var(--color-border)] mx-auto mb-4" />
            <h3 className="font-semibold text-[var(--color-text)] mb-2">No flashcards yet</h3>
            <p className="text-sm text-[var(--color-muted)]">
              Open a document and generate flashcards from the workspace.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {sets.map(set => (
              <motion.div key={set._id} layout exit={{ opacity: 0, y: -10 }}>
                <FlashcardSet set={set} onDelete={handleDelete} onFavorite={handleFavorite} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  )
}

export default FlashcardsPage
