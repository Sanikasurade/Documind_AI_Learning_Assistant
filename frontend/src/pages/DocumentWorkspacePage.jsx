import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, MessageSquare, Zap, BookOpen, BarChart3,
  Send, Sparkles, ChevronLeft, ChevronRight, Star,
  Loader2, RefreshCw, CheckCircle, XCircle, ArrowLeft,
  ExternalLink, Brain, Lightbulb, ClipboardList
} from 'lucide-react'
import { documentService } from '../services/documentService'
import { aiService } from '../services/aiService'
import { flashcardService } from '../services/flashcardService'
import { quizService } from '../services/quizService'
import Loader from '../components/common/Loader'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'ai', label: 'AI Actions', icon: Zap },
  { id: 'flashcards', label: 'Flashcards', icon: BookOpen },
  { id: 'quiz', label: 'Quiz', icon: BarChart3 },
]

// ── TAB 1: Content ────────────────────────────────────────────────────────────
const ContentTab = ({ document }) => {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '');
  const fileName = document.fileName || document.filePath?.split(/[\\/]/).pop();
  const fileUrl = `${baseUrl}/uploads/${fileName}`;

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[var(--color-text)]">{document.title}</h3>
          <p className="text-xs text-[var(--color-muted)]">
            {(document.fileSize / 1024).toFixed(0)} KB · Uploaded {new Date(document.createdAt).toLocaleDateString()}
          </p>
        </div>
        <a href={fileUrl} target="_blank" rel="noopener noreferrer"
          className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5">
          <ExternalLink size={13} /> Open Full Screen
        </a>
      </div>
      <div className="flex-1 rounded-2xl border border-[var(--color-border)] overflow-hidden min-h-[500px]">
        <iframe src={fileUrl} className="w-full h-full min-h-[500px]" title={document.title} />
      </div>
    </div>
  )
}

// ── TAB 2: Chat ───────────────────────────────────────────────────────────────
const ChatTab = ({ document }) => {
  const [messages, setMessages] = useState([
    { role: 'model', content: `Hi! I've read **${document.title}**. Ask me anything about it!` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const question = input.trim()
    setInput('')
    const history = messages.slice(1).map(m => ({ role: m.role, content: m.content }))
    setMessages(prev => [...prev, { role: 'user', content: question }])
    setLoading(true)
    try {
      const res = await aiService.chat(document._id, question, history)
      setMessages(prev => [...prev, { role: 'model', content: res.data.answer }])
    } catch {
      toast.error('AI response failed. Try again.')
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ height: '60vh' }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
              <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center
                              text-white mr-2 mt-1 flex-shrink-0">
                <Brain size={14} />
              </div>
            )}
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed
              ${msg.role === 'user'
                ? 'bg-primary-500 text-white rounded-br-sm'
                : 'bg-[var(--color-surface)] text-[var(--color-text)] rounded-bl-sm border border-[var(--color-border)]'
              }`}>
              {msg.content.split('\n').map((line, j) => (
                <span key={j}>{line.replace(/\*\*(.*?)\*\*/g, '$1')}{j < msg.content.split('\n').length - 1 && <br />}</span>
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center mr-2 mt-1">
              <Brain size={14} className="text-white" />
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)]
                            px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask about this document..."
          className="input flex-1"
          disabled={loading}
        />
        <button onClick={send} disabled={loading || !input.trim()}
          className="btn-primary px-4 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100">
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}

// ── TAB 3: AI Actions ─────────────────────────────────────────────────────────
const AITab = ({ document }) => {
  const [summary, setSummary] = useState(document.summary || '')
  const [concept, setConcept] = useState('')
  const [explanation, setExpl] = useState('')
  const [loadSum, setLoadSum] = useState(false)
  const [loadExp, setLoadExp] = useState(false)

  const generateSummary = async () => {
    setLoadSum(true)
    try {
      const res = await aiService.generateSummary(document._id)
      setSummary(res.data.summary)
      toast.success('Summary generated!')
    } catch { toast.error('Failed to generate summary.') }
    finally { setLoadSum(false) }
  }

  const explainConcept = async () => {
    if (!concept.trim()) { toast.error('Enter a concept to explain.'); return }
    setLoadExp(true)
    try {
      const res = await aiService.explainConcept(document._id, concept)
      setExpl(res.data.explanation)
    } catch { toast.error('Failed to explain concept.') }
    finally { setLoadExp(false) }
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-yellow-500/10 flex items-center justify-center">
            <Sparkles size={18} className="text-yellow-500" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text)]">Generate Summary</h3>
            <p className="text-xs text-[var(--color-muted)]">Quick overview for revision</p>
          </div>
          <button onClick={generateSummary} disabled={loadSum}
            className="btn-primary ml-auto py-2 px-4 text-sm disabled:opacity-60 disabled:hover:scale-100">
            {loadSum ? <Loader2 size={15} className="animate-spin" /> : <><Sparkles size={14} /> Generate</>}
          </button>
        </div>
        {summary && (
          <div className="bg-[var(--color-surface)] rounded-xl p-4 text-sm text-[var(--color-text)]
                          leading-relaxed whitespace-pre-line border border-[var(--color-border)]">
            {summary}
          </div>
        )}
      </div>

      {/* Explain Concept */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Lightbulb size={18} className="text-blue-500" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text)]">Explain a Concept</h3>
            <p className="text-xs text-[var(--color-muted)]">Deep dive into any topic</p>
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          <input value={concept} onChange={e => setConcept(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && explainConcept()}
            placeholder="e.g. Neural Networks, Photosynthesis..."
            className="input flex-1" />
          <button onClick={explainConcept} disabled={loadExp}
            className="btn-primary px-4 disabled:opacity-60 disabled:hover:scale-100">
            {loadExp ? <Loader2 size={15} className="animate-spin" /> : <Brain size={16} />}
          </button>
        </div>
        {explanation && (
          <div className="bg-[var(--color-surface)] rounded-xl p-4 text-sm text-[var(--color-text)]
                          leading-relaxed whitespace-pre-line border border-[var(--color-border)]">
            {explanation}
          </div>
        )}
      </div>
    </div>
  )
}

// ── TAB 4: Flashcards ─────────────────────────────────────────────────────────
const FlashcardsTab = ({ document }) => {
  const [sets, setSets] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGen] = useState(false)
  const [activeSet, setActiveSet] = useState(null)
  const [cardIdx, setCardIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    flashcardService.getByDocument(document._id)
      .then(r => { setSets(r.data.flashcards); if (r.data.flashcards.length) setActiveSet(r.data.flashcards[0]) })
      .finally(() => setLoading(false))
  }, [document._id])

  const generate = async () => {
    setGen(true)
    try {
      const res = await aiService.generateFlashcards(document._id)
      const newSet = res.data.flashcardSet
      setSets(prev => [newSet, ...prev])
      setActiveSet(newSet); setCardIdx(0); setFlipped(false)
      toast.success(`${newSet.cards.length} flashcards created!`)
    } catch { toast.error('Failed to generate flashcards.') }
    finally { setGen(false) }
  }

  const handleFav = async (cardIndex) => {
    try {
      const res = await flashcardService.toggleFavorite(activeSet._id, cardIndex)
      const updated = res.data.flashcardSet
      setSets(prev => prev.map(s => s._id === updated._id ? updated : s))
      setActiveSet(updated)
    } catch { toast.error('Failed to update.') }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader text="Loading flashcards..." /></div>

  const card = activeSet?.cards[cardIdx]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {sets.map(s => (
            <button key={s._id} onClick={() => { setActiveSet(s); setCardIdx(0); setFlipped(false) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${activeSet?._id === s._id ? 'bg-primary-500 text-white' : 'btn-secondary py-1.5 px-3'}`}>
              {s.setName.slice(0, 25)}{s.setName.length > 25 ? '...' : ''}
            </button>
          ))}
        </div>
        <button onClick={generate} disabled={generating}
          className="btn-primary py-2 px-4 text-sm disabled:opacity-60 disabled:hover:scale-100">
          {generating ? <Loader2 size={14} className="animate-spin" /> : <><Sparkles size={13} /> Generate New</>}
        </button>
      </div>

      {!activeSet ? (
        <div className="text-center py-16 card">
          <BookOpen size={40} className="text-[var(--color-border)] mx-auto mb-3" />
          <p className="text-[var(--color-muted)] text-sm">No flashcards yet. Generate your first set!</p>
        </div>
      ) : (
        <>
          {/* Flip card */}
          <div onClick={() => setFlipped(p => !p)} className="cursor-pointer"
            style={{ perspective: 1000, height: 220 }}>
            <motion.div animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 80 }}
              style={{ transformStyle: 'preserve-3d', position: 'relative', height: '100%' }}>
              {/* Front */}
              <div style={{ backfaceVisibility: 'hidden' }}
                className="absolute inset-0 card flex flex-col justify-between p-6 rounded-2xl">
                <div className="flex justify-between items-start">
                  <span className="badge">Question {cardIdx + 1}/{activeSet.cards.length}</span>
                  <button onClick={e => { e.stopPropagation(); handleFav(cardIdx) }}
                    className={card?.isFavorite ? 'text-yellow-400' : 'text-[var(--color-muted)] hover:text-yellow-400'}>
                    <Star size={16} fill={card?.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <p className="text-[var(--color-text)] font-medium text-base">{card?.question}</p>
                <p className="text-xs text-[var(--color-muted)]">Click to reveal answer ↻</p>
              </div>
              {/* Back */}
              <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                className="absolute inset-0 bg-primary-500/10 border border-primary-500/20
                           rounded-2xl flex flex-col justify-between p-6">
                <span className="badge self-start">Answer</span>
                <p className="text-[var(--color-text)] text-sm leading-relaxed">{card?.answer}</p>
                <p className="text-xs text-primary-500">Click to flip back ↻</p>
              </div>
            </motion.div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button disabled={cardIdx === 0} onClick={() => { setCardIdx(p => p - 1); setFlipped(false) }}
              className="btn-secondary py-2 px-4 text-sm disabled:opacity-30">
              <ChevronLeft size={16} /> Prev
            </button>
            <div className="flex gap-1">
              {activeSet.cards.map((_, i) => (
                <div key={i} onClick={() => { setCardIdx(i); setFlipped(false) }}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-all
                    ${i === cardIdx ? 'bg-primary-500 w-4' : 'bg-[var(--color-border)] hover:bg-primary-400'}`} />
              ))}
            </div>
            <button disabled={cardIdx === activeSet.cards.length - 1} onClick={() => { setCardIdx(p => p + 1); setFlipped(false) }}
              className="btn-secondary py-2 px-4 text-sm disabled:opacity-30">
              Next <ChevronRight size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ── TAB 5: Quiz ───────────────────────────────────────────────────────────────
const QuizTab = ({ document }) => {
  const [phase, setPhase] = useState('setup') // setup | playing | result
  const [quizzes, setQuizzes] = useState([])
  const [numQ, setNumQ] = useState(10)
  const [generating, setGen] = useState(false)
  const [activeQuiz, setAQ] = useState(null)
  const [answers, setAnswers] = useState({})
  const [currentQ, setCurrentQ] = useState(0)
  const [result, setResult] = useState(null)
  const [submitting, setSub] = useState(false)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    quizService.getByDocument(document._id)
      .then(r => setQuizzes(r.data.quizzes))
  }, [document._id])

  const generate = async () => {
    setGen(true)
    try {
      const res = await aiService.generateQuiz(document._id, numQ)
      const quiz = res.data.quiz
      setQuizzes(prev => [quiz, ...prev])
      // Load full quiz for playing
      const full = await quizService.getById(quiz._id)
      setAQ(full.data.quiz); setPhase('playing'); setCurrentQ(0); setAnswers({})
      toast.success(`${quiz.questions.length} questions generated!`)
    } catch { toast.error('Failed to generate quiz.') }
    finally { setGen(false) }
  }

  const startQuiz = async (quiz) => {
    const full = await quizService.getById(quiz._id)
    setAQ(full.data.quiz); setPhase('playing'); setCurrentQ(0); setAnswers({})
  }

  const submitQuiz = async () => {
    if (!activeQuiz) return
    setSub(true)
    try {
      const formatted = activeQuiz.questions.map((_, i) => ({
        questionIndex: i, selectedOption: answers[i] || null
      }))
      const timeTaken = Math.round((Date.now() - startTime) / 1000)
      const res = await quizService.submit(activeQuiz._id, formatted, timeTaken)
      setResult(res.data.result); setPhase('result')
    } catch { toast.error('Failed to submit quiz.') }
    finally { setSub(false) }
  }

  // ── Setup phase
  if (phase === 'setup') return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <ClipboardList size={18} className="text-purple-500" />
          </div>
          <h3 className="font-semibold text-[var(--color-text)]">Generate New Quiz</h3>
        </div>
        <div className="mb-4">
          <label className="label">Number of Questions</label>
          <div className="flex gap-2">
            {[5, 10, 15, 20].map(n => (
              <button key={n} onClick={() => setNumQ(n)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all
                  ${numQ === n ? 'bg-primary-500 text-white' : 'btn-secondary py-2'}`}>
                {n}
              </button>
            ))}
          </div>
        </div>
        <button onClick={generate} disabled={generating}
          className="btn-primary w-full justify-center disabled:opacity-60 disabled:hover:scale-100">
          {generating ? <><Loader2 size={15} className="animate-spin" /> Generating...</> : <><Sparkles size={15} /> Generate Quiz</>}
        </button>
      </div>

      {/* Previous quizzes */}
      {quizzes.length > 0 && (
        <div>
          <h3 className="font-semibold text-[var(--color-text)] mb-3">Previous Quizzes</h3>
          <div className="space-y-2">
            {quizzes.map(q => (
              <div key={q._id} onClick={() => startQuiz(q)}
                className="card-hover flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-sm text-[var(--color-text)]">{q.title}</p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {new Date(q.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="badge">{q.questions?.length || numQ} Qs</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  // ── Playing phase
  if (phase === 'playing' && activeQuiz) {
    const q = activeQuiz.questions[currentQ]
    const isLast = currentQ === activeQuiz.questions.length - 1
    const progress = ((currentQ + 1) / activeQuiz.questions.length) * 100

    return (
      <div className="space-y-5">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs text-[var(--color-muted)] mb-2">
            <span>Question {currentQ + 1} of {activeQuiz.questions.length}</span>
            <span>{Object.keys(answers).length} answered</span>
          </div>
          <div className="h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary-500 rounded-full"
              animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }} className="card">
            <p className="font-semibold text-[var(--color-text)] mb-5 leading-relaxed">{q.question}</p>
            <div className="space-y-2.5">
              {Object.entries(q.options).map(([key, val]) => (
                <button key={key} onClick={() => setAnswers(prev => ({ ...prev, [currentQ]: key }))}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all border
                    ${answers[currentQ] === key
                      ? 'border-primary-500 bg-primary-500/10 text-primary-500 font-medium'
                      : 'border-[var(--color-border)] hover:border-primary-400 text-[var(--color-text)]'
                    }`}>
                  <span className="font-bold mr-3">{key}.</span>{val}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3">
          <button disabled={currentQ === 0} onClick={() => setCurrentQ(p => p - 1)}
            className="btn-secondary flex-1 justify-center disabled:opacity-30">
            <ChevronLeft size={16} /> Prev
          </button>
          {isLast ? (
            <button onClick={submitQuiz} disabled={submitting}
              className="btn-primary flex-1 justify-center disabled:opacity-60 disabled:hover:scale-100">
              {submitting ? <Loader2 size={15} className="animate-spin" /> : 'Submit Quiz ✓'}
            </button>
          ) : (
            <button onClick={() => setCurrentQ(p => p + 1)}
              className="btn-primary flex-1 justify-center">
              Next <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Result phase
  if (phase === 'result' && result) return (
    <div className="space-y-5">
      {/* Score card */}
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="card text-center p-8">
        <div className={`text-6xl font-bold mb-2 ${result.percentage >= 70 ? 'text-primary-500' : result.percentage >= 40 ? 'text-yellow-500' : 'text-red-400'
          }`} style={{ fontFamily: "'Clash Display', sans-serif" }}>
          {result.percentage}%
        </div>
        <p className="text-[var(--color-muted)] mb-6">
          {result.score}/{result.totalQuestions} correct
          {result.percentage >= 70 ? ' · Great job! 🎉' : result.percentage >= 40 ? ' · Keep practicing!' : ' · Review the material!'}
        </p>
        <div className="flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-1.5 text-primary-500">
            <CheckCircle size={16} /> {result.score} Correct
          </div>
          <div className="flex items-center gap-1.5 text-red-400">
            <XCircle size={16} /> {result.totalQuestions - result.score} Wrong
          </div>
        </div>
      </motion.div>

      {/* Detailed review */}
      <h3 className="font-semibold text-[var(--color-text)]">Detailed Review</h3>
      {result.detailedResults?.map((r, i) => (
        <div key={i} className={`card border ${r.isCorrect ? 'border-primary-500/20' : 'border-red-400/20'}`}>
          <div className="flex items-start gap-2 mb-3">
            {r.isCorrect
              ? <CheckCircle size={16} className="text-primary-500 mt-0.5 flex-shrink-0" />
              : <XCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
            }
            <p className="text-sm font-medium text-[var(--color-text)]">{r.question}</p>
          </div>
          <div className="space-y-1 text-xs ml-6">
            <p className="text-[var(--color-muted)]">
              Your answer: <span className={r.isCorrect ? 'text-primary-500' : 'text-red-400'}>{r.userAnswer || 'Not answered'}</span>
            </p>
            {!r.isCorrect && <p className="text-[var(--color-muted)]">Correct: <span className="text-primary-500">{r.correctAnswer}</span></p>}
            {r.explanation && (
              <p className="text-[var(--color-muted)] mt-2 p-2 bg-[var(--color-surface)] rounded-lg">{r.explanation}</p>
            )}
          </div>
        </div>
      ))}

      <button onClick={() => setPhase('setup')}
        className="btn-secondary w-full justify-center">
        <RefreshCw size={15} /> Take Another Quiz
      </button>
    </div>
  )

  return null
}

// ── Main Workspace Page ───────────────────────────────────────────────────────
const DocumentWorkspacePage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [document, setDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('content')

  useEffect(() => {
    documentService.getById(id)
      .then(r => setDocument(r.data.document))
      .catch(() => { toast.error('Document not found.'); navigate('/dashboard') })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Loader size="lg" text="Loading document..." />
    </div>
  )

  if (!document) return null

  return (
    <div className="page-container py-6">
      {/* Back + title */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/dashboard')}
          className="w-9 h-9 rounded-xl flex items-center justify-center
                     text-[var(--color-muted)] hover:text-[var(--color-text)]
                     hover:bg-[var(--color-surface)] transition-all">
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
            <FileText size={16} className="text-primary-500" />
          </div>
          <h1 className="font-semibold text-[var(--color-text)] truncate max-w-sm">
            {document.title}
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[var(--color-surface)] rounded-2xl mb-6
                      border border-[var(--color-border)] overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium
                        whitespace-nowrap transition-all duration-200 flex-1 justify-center
              ${activeTab === id
                ? 'bg-[var(--color-bg)] text-[var(--color-text)] shadow-sm'
                : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
              }`}>
            <Icon size={15} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          {activeTab === 'content' && <ContentTab document={document} />}
          {activeTab === 'chat' && <ChatTab document={document} />}
          {activeTab === 'ai' && <AITab document={document} />}
          {activeTab === 'flashcards' && <FlashcardsTab document={document} />}
          {activeTab === 'quiz' && <QuizTab document={document} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default DocumentWorkspacePage
