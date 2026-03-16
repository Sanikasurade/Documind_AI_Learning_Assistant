import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { PageLoader } from './components/common/Loader'
import ProtectedRoute from './components/common/ProtectedRoute'
import GuestRoute from './components/common/GuestRoute'
import Navbar from './components/common/Navbar'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import OTPPage from './pages/OTPPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import DocumentWorkspacePage from './pages/DocumentWorkspacePage'
import FlashcardsPage from './pages/FlashcardsPage'
import ProfilePage from './pages/ProfilePage'

const App = () => {
  const { loading } = useAuth()
  if (loading) return <PageLoader />

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={
          <GuestRoute><LoginPage /></GuestRoute>
        } />
        <Route path="/signup" element={
          <GuestRoute><SignupPage /></GuestRoute>
        } />
        <Route path="/verify-otp" element={
          <GuestRoute><OTPPage /></GuestRoute>
        } />
        <Route path="/forgot-password" element={
          <GuestRoute><ForgotPasswordPage /></GuestRoute>
        } />
        <Route path="/reset-password" element={
          <GuestRoute><ResetPasswordPage /></GuestRoute>
        } />


        {/* Protected */}
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/document/:id" element={
          <ProtectedRoute><DocumentWorkspacePage /></ProtectedRoute>
        } />
        <Route path="/flashcards" element={
          <ProtectedRoute><FlashcardsPage /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />

        {/* Fallback — MUST be last */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App