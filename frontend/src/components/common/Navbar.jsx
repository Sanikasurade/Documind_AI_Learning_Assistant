import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sun, Moon, LogOut, BookOpen, LayoutDashboard, CreditCard, Brain } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/flashcards', label: 'Flashcards', icon: CreditCard },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-[var(--color-border)]
                 bg-[var(--color-bg)]/80 backdrop-blur-xl"
    >
      <div className="page-container">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center
                            group-hover:scale-110 transition-transform duration-200">
              <Brain size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-[var(--color-text)]">
              StudyGenie <span className="gradient-text">AI</span>
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2">

            {/* Nav links — only when logged in */}
            {user && (
              <div className="hidden sm:flex items-center gap-1 mr-2">
                {navLinks.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                                transition-all duration-200
                                ${isActive(to)
                        ? 'bg-primary-500/10 text-primary-500'
                        : 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]'
                      }`}
                  >
                    <Icon size={15} />
                    {label}
                  </Link>
                ))}
              </div>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg flex items-center justify-center
                         text-[var(--color-muted)] hover:text-[var(--color-text)]
                         hover:bg-[var(--color-surface)] transition-all duration-200"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* User menu */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                             hover:bg-[var(--color-surface)] transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center
                                  justify-center text-white text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-[var(--color-text)]">
                    {user.name?.split(' ')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-9 h-9 rounded-lg flex items-center justify-center
                             text-[var(--color-muted)] hover:text-red-400
                             hover:bg-red-400/10 transition-all duration-200"
                  aria-label="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary py-2 px-4 text-sm">Login</Link>
                <Link to="/signup" className="btn-primary  py-2 px-4 text-sm">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar
