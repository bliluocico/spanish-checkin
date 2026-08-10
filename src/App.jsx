import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './authContext'
import AuthGuard from './components/AuthGuard'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import ChallengeListPage from './pages/ChallengeListPage'
import ChallengeDetailPage from './pages/ChallengeDetailPage'
import VerbsPracticePage from './pages/VerbsPracticePage'
import Navbar from './components/Navbar'
import ErrorBoundary from './components/ErrorBoundary'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--parchment)' }}>
        <div className="text-center">
          <div className="text-5xl mb-4" style={{ animation: 'fadeUp 0.6s ease-out' }}>🌸</div>
          <p className="text-sm" style={{ color: 'var(--ink-light)' }}>加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--parchment)' }}>
      <ErrorBoundary>
        <div className="flex-1">
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
            <Route path="/" element={<AuthGuard><HomePage /></AuthGuard>} />
            <Route path="/challenges" element={<AuthGuard><ChallengeListPage /></AuthGuard>} />
            <Route path="/challenges/:id" element={<AuthGuard><ChallengeDetailPage /></AuthGuard>} />
            <Route path="/practice" element={<AuthGuard><VerbsPracticePage /></AuthGuard>} />
            <Route path="/profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />
          </Routes>
        </div>
      </ErrorBoundary>
      {user && <Navbar />}
    </div>
  )
}
