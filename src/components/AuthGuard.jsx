import { Navigate } from 'react-router-dom'
import { useAuth } from '../authContext'

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5F0EB]">
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-3">🌸</div>
          <p className="text-[#7A7A7A]">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
