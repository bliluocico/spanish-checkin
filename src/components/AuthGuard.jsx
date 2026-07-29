import { Navigate } from 'react-router-dom'
import { useAuth } from '../authContext'

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFF8F0]">
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-3">🌸</div>
          <p className="text-[#8B7355]">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
