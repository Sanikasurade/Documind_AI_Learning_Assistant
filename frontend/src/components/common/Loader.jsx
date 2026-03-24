const Loader = ({ size = 'md', text = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-2 border-[var(--color-border)]" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent
                        border-t-primary-500 animate-spin" />
      </div>
      {text && (
        <p className="text-sm text-[var(--color-muted)] animate-pulse">{text}</p>
      )}
    </div>
  )
}

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 relative">
        <div className="absolute inset-0 rounded-full border-2 border-[var(--color-border)]" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent
                        border-t-primary-500 animate-spin" />
      </div>
      <p className="text-sm text-[var(--color-muted)] font-medium">Loading DocuMind...</p>
    </div>
  </div>
)

export default Loader
