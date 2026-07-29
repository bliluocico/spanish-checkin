import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './authContext'
import AuthGuard from './components/AuthGuard'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import ChallengeListPage from './pages/ChallengeListPage'
import ChallengeDetailPage from './pages/ChallengeDetailPage'
import Navbar from './components/Navbar'
import { AnimatePresence } from 'framer-motion'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFF8F0]">
        <div className="text-center">
          <div className="text-5xl animate-bounce mb-4">🌸</div>
          <p className="text-[#8B7355] text-lg">正在加载...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatePresence mode="wait">
        <div className="flex-1 pb-20">
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
            <Route path="/" element={<AuthGuard><HomePage /></AuthGuard>} />
            <Route path="/challenges" element={<AuthGuard><ChallengeListPage /></AuthGuard>} />
            <Route path="/challenges/:id" element={<AuthGuard><ChallengeDetailPage /></AuthGuard>} />
            <Route path="/profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />
          </Routes>
        </div>
      </AnimatePresence>
      {user && <Navbar />}
    </div>
  )
}
