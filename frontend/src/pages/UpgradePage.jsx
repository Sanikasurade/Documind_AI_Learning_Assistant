import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Zap, Crown, ArrowLeft, Star, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import paymentService from '../services/paymentService'
import toast from 'react-hot-toast'

// ── Plan Data ─────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    period: 'forever',
    color: 'from-slate-500 to-slate-600',
    border: 'border-[var(--color-border)]',
    icon: Star,
    iconColor: 'text-slate-400',
    iconBg: 'bg-slate-500/10',
    badge: null,
    features: [
      '5 document uploads',
      'AI chat with documents',
      'Auto-generated flashcards',
      'Quiz generation',
      'Chat history saved',
    ],
    missing: ['Unlimited uploads', 'Priority AI responses'],
    cta: 'Current Plan',
    ctaStyle: 'btn-secondary w-full justify-center py-3 opacity-60 cursor-not-allowed',
    disabled: true,
  },
  {
    id: 'monthly',
    name: 'Monthly Pro',
    price: '₹199',
    period: 'per month',
    color: 'from-primary-500 to-primary-600',
    border: 'border-primary-500/30',
    icon: Zap,
    iconColor: 'text-primary-400',
    iconBg: 'bg-primary-500/10',
    badge: 'Most Popular',
    features: [
      'Unlimited document uploads',
      'AI chat with documents',
      'Auto-generated flashcards',
      'Quiz generation',
      'Chat history saved',
      'Priority AI responses',
    ],
    missing: [],
    cta: 'Upgrade to Monthly',
    ctaStyle: 'btn-primary w-full justify-center py-3',
    disabled: false,
  },
  {
    id: 'yearly',
    name: 'Yearly Pro',
    price: '₹1,499',
    period: 'per year',
    color: 'from-purple-500 to-pink-500',
    border: 'border-purple-500/30',
    icon: Crown,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/10',
    badge: 'Save 37%',
    features: [
      'Unlimited document uploads',
      'AI chat with documents',
      'Auto-generated flashcards',
      'Quiz generation',
      'Chat history saved',
      'Priority AI responses',
    ],
    missing: [],
    cta: 'Upgrade to Yearly',
    ctaStyle:
      'w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ' +
      'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 hover:scale-[1.02] active:scale-100',
    disabled: false,
  },
]

// ── Helper — load Razorpay SDK on demand ──────────────────────────────────────
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

// ── Plan Card ─────────────────────────────────────────────────────────────────
const PlanCard = ({ plan, userPlan, onSelect, loading }) => {
  const isCurrentPlan = userPlan === plan.id
  const Icon = plan.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: PLANS.indexOf(plan) * 0.1 }}
      className={`relative flex flex-col rounded-3xl border p-8 ${plan.border}
                  bg-[var(--color-surface)] hover:shadow-2xl transition-all duration-300`}
    >
      {/* Popular / Save badge */}
      {plan.badge && (
        <div
          className={`absolute -top-3.5 left-1/2 -translate-x-1/2
                      px-4 py-1 rounded-full text-xs font-bold text-white whitespace-nowrap
                      bg-gradient-to-r ${plan.color}`}
        >
          {plan.badge}
        </div>
      )}

      {/* Icon */}
      <div className={`w-12 h-12 rounded-2xl ${plan.iconBg} flex items-center justify-center mb-5`}>
        <Icon size={22} className={plan.iconColor} />
      </div>

      {/* Name & Price */}
      <h3 className="text-xl font-bold text-[var(--color-text)] mb-1">{plan.name}</h3>
      <div className="flex items-end gap-1 mb-1">
        <span
          className="text-4xl font-extrabold text-[var(--color-text)]"
          style={{ fontFamily: "'Clash Display', sans-serif" }}
        >
          {plan.price}
        </span>
      </div>
      <p className="text-sm text-[var(--color-muted)] mb-6">{plan.period}</p>

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-[var(--color-text)]">
            <Check size={15} className="text-green-400 shrink-0" />
            {f}
          </li>
        ))}
        {plan.missing.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-[var(--color-muted)] line-through">
            <span className="w-[15px] h-[15px] shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      {isCurrentPlan && userPlan !== 'free' ? (
        <div className="w-full py-3 rounded-xl text-center text-sm font-semibold text-green-400 border border-green-400/30 bg-green-400/5">
          ✓ Active Plan
        </div>
      ) : (
        <button
          onClick={() => !plan.disabled && onSelect(plan.id)}
          disabled={plan.disabled || loading === plan.id}
          className={plan.ctaStyle + ' disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100'}
        >
          {loading === plan.id ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            plan.cta
          )}
        </button>
      )}
    </motion.div>
  )
}

// ── Upgrade Page ──────────────────────────────────────────────────────────────
const UpgradePage = () => {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(null) // plan id being processed

  // Determine user's current plan (default free)
  const userPlan = user?.plan || 'free'

  const handleSelect = async (planId) => {
    if (planId === 'free') return
    setLoading(planId)

    try {
      // 1. Load Razorpay SDK
      const sdkLoaded = await loadRazorpay()
      if (!sdkLoaded) {
        toast.error('Failed to load payment gateway. Check your internet connection.')
        setLoading(null)
        return
      }

      // 2. Create order on backend
      const { data } = await paymentService.createOrder(planId)

      // 3. Open Razorpay checkout modal
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'DocuMind',
        description: data.planLabel,
        order_id: data.orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: { color: '#6366f1' },
        handler: async (response) => {
          try {
            // 4. Verify on backend
            const verifyRes = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planType: planId,
            })

            // 5. Update user in local state/storage
            if (updateUser) {
              updateUser({ ...user, plan: 'pro', planExpiresAt: verifyRes.data.user.planExpiresAt })
            }

            toast.success(verifyRes.data.message || "You're now on Pro! 🎉")
            navigate('/dashboard')
          } catch {
            toast.error('Payment verification failed. Contact support.')
          } finally {
            setLoading(null)
          }
        },
        modal: {
          ondismiss: () => setLoading(null),
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="page-container py-12">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]
                   transition-colors mb-10"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </motion.button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-14"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                        bg-primary-500/10 border border-primary-500/20 mb-5">
          <Sparkles size={14} className="text-primary-400" />
          <span className="text-sm text-primary-400 font-medium">Unlock unlimited learning</span>
        </div>

        <h1
          className="text-4xl md:text-5xl font-extrabold text-[var(--color-text)] mb-4"
          style={{ fontFamily: "'Clash Display', sans-serif" }}
        >
          Choose your <span className="gradient-text">plan</span>
        </h1>
        <p className="text-[var(--color-muted)] text-lg max-w-xl mx-auto">
          You've hit the <span className="text-[var(--color-text)] font-medium">5-document limit</span> on the Free plan.
          Upgrade to Pro for unlimited uploads and priority AI responses.
        </p>
      </motion.div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            userPlan={userPlan}
            onSelect={handleSelect}
            loading={loading}
          />
        ))}
      </div>

      {/* Trust line */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-[var(--color-muted)] mt-10"
      >
        🔒 Secured by Razorpay · Cancel anytime · No hidden charges
      </motion.p>
    </div>
  )
}

export default UpgradePage
