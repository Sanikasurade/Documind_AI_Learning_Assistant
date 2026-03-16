import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Brain, Upload, MessageSquare, Zap, BookOpen,
  BarChart3, ChevronRight, Sparkles, FileText,
  CheckCircle, ArrowRight, Star
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } }

// ── Hero ────────────────────────────────────────────────────────────────────
const Hero = () => (
  <section className="relative overflow-hidden pt-20 pb-32">
    {/* Background grid + glow */}
    <div className="absolute inset-0 bg-grid-pattern opacity-50" />
    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
                    w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl" />

    <div className="page-container relative z-10">
      <motion.div
        variants={stagger} initial="hidden" animate="show"
        className="text-center max-w-4xl mx-auto"
      >
        {/* Badge */}
        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 mb-6">
          <span className="badge text-sm px-4 py-1.5">
            <Sparkles size={13} /> Powered by Google Gemini AI
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="text-5xl md:text-7xl font-bold leading-[1.08] mb-6
                     text-[var(--color-text)] tracking-tight"
          style={{ fontFamily: "'Clash Display', sans-serif" }}
        >
          Turn Any PDF Into{' '}
          <span className="gradient-text">Your Personal</span>
          <br />AI Tutor
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={fadeUp}
          className="text-lg md:text-xl text-[var(--color-muted)] mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Upload study documents and instantly generate summaries, flashcards,
          quizzes, and get AI-powered answers — all grounded in your content.
        </motion.p>

        {/* CTA buttons */}
        <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/signup" className="btn-primary text-base px-8 py-4 rounded-2xl">
            Start Learning Free <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-secondary text-base px-8 py-4 rounded-2xl">
            Sign In
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          variants={fadeUp}
          className="mt-12 flex flex-wrap items-center justify-center gap-6
                     text-sm text-[var(--color-muted)]"
        >
          {['No credit card required', 'Free to get started', 'Powered by Gemini 1.5'].map(t => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-primary-500" /> {t}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* Hero card mockup */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mt-20 max-w-4xl mx-auto"
      >
        <div className="relative rounded-3xl border border-[var(--color-border)]
                        bg-[var(--color-bg-soft)] p-1 shadow-2xl shadow-primary-500/10">
          {/* Fake browser bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
              <div className="w-3 h-3 rounded-full bg-primary-400/70" />
            </div>
            <div className="flex-1 mx-4 h-6 rounded-lg bg-[var(--color-surface)]
                            flex items-center px-3">
              <span className="text-xs text-[var(--color-muted)]">studygenie.ai/dashboard</span>
            </div>
          </div>
          {/* Dashboard preview */}
          <div className="p-6 grid grid-cols-3 gap-4">
            {[
              { label: 'Documents', value: '12', icon: FileText, color: 'text-blue-400' },
              { label: 'Flashcards', value: '248', icon: BookOpen, color: 'text-primary-400' },
              { label: 'Quizzes', value: '36', icon: BarChart3, color: 'text-purple-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card text-center">
                <Icon size={24} className={`${color} mx-auto mb-2`} />
                <div className="text-2xl font-bold text-[var(--color-text)]">{value}</div>
                <div className="text-xs text-[var(--color-muted)]">{label}</div>
              </div>
            ))}
          </div>
          <div className="px-6 pb-6 grid grid-cols-2 gap-4">
            <div className="card">
              <div className="text-xs text-[var(--color-muted)] mb-2 font-medium">RECENT DOCUMENT</div>
              <div className="font-semibold text-[var(--color-text)] text-sm">Machine Learning Notes.pdf</div>
              <div className="mt-3 flex gap-2">
                <span className="badge text-xs">12 Flashcards</span>
                <span className="badge text-xs">3 Quizzes</span>
              </div>
            </div>
            <div className="card bg-primary-500/5 border-primary-500/20">
              <div className="text-xs text-primary-500 mb-2 font-medium">AI CHAT</div>
              <div className="text-sm text-[var(--color-muted)]">
                "What is gradient descent?"
              </div>
              <div className="mt-2 text-xs text-[var(--color-text)] line-clamp-2">
                Gradient descent is an optimization algorithm that minimizes a function by...
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
)

// ── Features ────────────────────────────────────────────────────────────────
const features = [
  {
    icon: MessageSquare,
    title: 'AI Document Chat',
    desc: 'Ask any question about your document. Get instant, accurate answers sourced directly from your content.',
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    icon: Zap,
    title: 'Smart Summaries',
    desc: 'Generate concise, structured summaries with key topics and takeaways — perfect for last-minute revision.',
    color: 'bg-yellow-500/10 text-yellow-500',
  },
  {
    icon: BookOpen,
    title: 'Auto Flashcards',
    desc: 'AI scans your document and creates interactive flip flashcards from key terms and concepts.',
    color: 'bg-primary-500/10 text-primary-500',
  },
  {
    icon: BarChart3,
    title: 'Quiz Generator',
    desc: 'Generate MCQ quizzes with explanations. Track scores and review detailed results for every question.',
    color: 'bg-purple-500/10 text-purple-500',
  },
  {
    icon: Brain,
    title: 'Concept Explainer',
    desc: 'Type any topic and get a detailed AI explanation using your document as the knowledge source.',
    color: 'bg-pink-500/10 text-pink-500',
  },
  {
    icon: Upload,
    title: 'Drag & Drop Upload',
    desc: 'Upload PDFs with a simple drag and drop. Your documents are processed instantly.',
    color: 'bg-orange-500/10 text-orange-500',
  },
]

const Features = () => (
  <section className="py-24 bg-[var(--color-bg-soft)]">
    <div className="page-container">
      <motion.div
        variants={stagger} initial="hidden" whileInView="show"
        viewport={{ once: true }} className="text-center mb-16"
      >
        <motion.div variants={fadeUp}>
          <span className="badge mb-4">Features</span>
        </motion.div>
        <motion.h2 variants={fadeUp} className="section-title mb-4">
          Everything You Need to Study Smarter
        </motion.h2>
        <motion.p variants={fadeUp} className="text-[var(--color-muted)] max-w-xl mx-auto">
          Six powerful AI tools that transform any PDF into a complete study toolkit.
        </motion.p>
      </motion.div>

      <motion.div
        variants={stagger} initial="hidden" whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {features.map(({ icon: Icon, title, desc, color }) => (
          <motion.div key={title} variants={fadeUp} className="card-hover group">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
              <Icon size={22} />
            </div>
            <h3 className="font-semibold text-[var(--color-text)] mb-2">{title}</h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">{desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
)

// ── How It Works ─────────────────────────────────────────────────────────────
const steps = [
  { num: '01', title: 'Upload Your PDF',      desc: 'Drag and drop any study document. We extract and process all the text instantly.' },
  { num: '02', title: 'Choose Your Tool',     desc: 'Pick from chat, summary, flashcards, or quiz — whatever fits your study style.' },
  { num: '03', title: 'AI Does the Work',     desc: 'Gemini AI analyzes your document and generates high-quality study materials.' },
  { num: '04', title: 'Learn & Track',        desc: 'Study with interactive tools and track your quiz scores and progress over time.' },
]

const HowItWorks = () => (
  <section className="py-24">
    <div className="page-container">
      <motion.div
        variants={stagger} initial="hidden" whileInView="show"
        viewport={{ once: true }} className="text-center mb-16"
      >
        <motion.div variants={fadeUp}><span className="badge mb-4">How It Works</span></motion.div>
        <motion.h2 variants={fadeUp} className="section-title mb-4">
          From PDF to Mastery in 4 Steps
        </motion.h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map(({ num, title, desc }, i) => (
          <motion.div
            key={num}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className="hidden lg:block absolute top-8 left-[calc(100%-12px)] w-6
                              h-px bg-[var(--color-border)] z-10" />
            )}
            <div className="card h-full">
              <div className="text-4xl font-bold gradient-text mb-4"
                   style={{ fontFamily: "'Clash Display', sans-serif" }}>{num}</div>
              <h3 className="font-semibold text-[var(--color-text)] mb-2">{title}</h3>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed">{desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
)

// ── CTA ───────────────────────────────────────────────────────────────────────
const CTA = () => (
  <section className="py-24 bg-[var(--color-bg-soft)]">
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative rounded-3xl overflow-hidden border border-primary-500/20
                   bg-gradient-to-br from-primary-500/10 via-transparent to-primary-900/10 p-12 text-center"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px
                        bg-gradient-to-r from-transparent via-primary-500 to-transparent" />
        <Brain size={40} className="text-primary-500 mx-auto mb-6" />
        <h2 className="section-title mb-4">Ready to Study Smarter?</h2>
        <p className="text-[var(--color-muted)] mb-8 max-w-md mx-auto">
          Join thousands of students turning their PDFs into powerful learning experiences.
        </p>
        <Link to="/signup" className="btn-primary text-base px-10 py-4 rounded-2xl">
          Get Started Free <ChevronRight size={18} />
        </Link>
      </motion.div>
    </div>
  </section>
)

// ── Footer ────────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="border-t border-[var(--color-border)] py-10">
    <div className="page-container flex flex-col sm:flex-row items-center
                    justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center">
          <Brain size={15} className="text-white" />
        </div>
        <span className="font-semibold text-[var(--color-text)]">StudyGenie AI</span>
      </div>
      <p className="text-sm text-[var(--color-muted)]">
        © {new Date().getFullYear()} StudyGenie AI. Built for students, by students.
      </p>
    </div>
  </footer>
)

// ── Page ──────────────────────────────────────────────────────────────────────
const HomePage = () => (
  <main>
    <Hero />
    <Features />
    <HowItWorks />
    <CTA />
    <Footer />
  </main>
)

export default HomePage
