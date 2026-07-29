import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Plus, Users, CalendarDays, Clock, RefreshCw, Target, Flag, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../authContext'
import { useNavigate } from 'react-router-dom'
import CreateChallengeModal from '../components/CreateChallengeModal'

export default function ChallengeListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  const fetchChallenges = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          creator:creator_id (nickname),
          participants:challenge_participants(user_id, status)
        `)
        .or(`creator_id.eq.${user.id},id.in.(select challenge_id from challenge_participants where user_id=eq.${user.id})`)
        .order('created_at', { ascending: false })

      if (error) throw error
      setChallenges(data || [])
    } catch (err) {
      console.error('获取挑战列表失败:', err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchChallenges()
  }, [fetchChallenges])

  const handleCreateSuccess = () => {
    setShowCreate(false)
    fetchChallenges()
  }

  const getStatusBadge = (challenge) => {
    if (challenge.status === 'completed') {
      if (challenge.winner_id === user.id) return { icon: '🏆', text: '你赢了！', color: 'bg-[#EDEBE0] text-[#8B6914]' }
      if (challenge.failed_user_id === user.id) return { icon: '💔', text: '败北', color: 'bg-[#EDE5E5] text-[#8B4444]' }
      return { icon: '🤝', text: '平局', color: 'bg-[#E8ECE5] text-[#4A6B4A]' }
    }
    return { icon: '🔥', text: '进行中', color: 'bg-[#F0ECE8] text-[#6B4E00]' }
  }

  const countUserCheckins = async (challengeId, userId) => {
    const { count } = await supabase
      .from('checkins')
      .select('*', { count: 'exact', head: true })
      .eq('challenge_id', challengeId)
      .eq('user_id', userId)
    return count || 0
  }

  return (
    <div className="min-h-screen bg-[#F5F0EB]">
      {/* 顶部标题栏 */}
      <div className="sticky top-0 z-30 bg-[#F5F0EB]/80 backdrop-blur-xl border-b border-[#E5E0DA]/30">
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[#2D2D2D] flex items-center gap-2">
              🏆 打卡挑战
            </h1>
            <p className="text-xs text-[#A0A0A0] mt-0.5">和好朋友一起坚持学习</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchChallenges}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-[#A0A0A0] hover:text-[#4A6FA5] shadow-sm transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 bg-[#4A6FA5] text-white text-sm font-bold rounded-xl shadow-md hover:bg-[#3A5A8C] transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              新建
            </button>
          </div>
        </div>
      </div>

      {/* 挑战列表 */}
      <div className="px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <div className="text-5xl animate-bounce mb-4">🏆</div>
            <p className="text-[#A0A0A0]">加载挑战列表...</p>
          </div>
        ) : challenges.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center py-16 px-4"
          >
            <div className="text-7xl mb-6">🎯</div>
            <h2 className="text-xl font-bold text-[#2D2D2D] mb-2">还没有挑战</h2>
            <p className="text-[#7A7A7A] text-center mb-4">
              创建一个打卡挑战，邀请好友一起完成！
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-3 bg-[#4A6FA5] text-white font-bold rounded-lg shadow-lg hover:bg-[#3A5A8C] transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              创建第一个挑战
            </button>
          </motion.div>
        ) : (
          challenges.map((challenge, i) => {
            const badge = getStatusBadge(challenge)
            const endDate = new Date(challenge.start_date)
            endDate.setDate(endDate.getDate() + challenge.total_days)
            const isActive = challenge.status === 'active'
            const today = new Date().toISOString().split('T')[0]
            const hasStarted = today >= challenge.start_date

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => navigate(`/challenges/${challenge.id}`)}
                className="bg-white rounded-xl p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)] cursor-pointer hover:shadow-[0_1px_8px_rgba(74,111,165,0.07)] transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-extrabold text-[#2D2D2D] truncate">
                      {challenge.title}
                    </h3>
                    {challenge.description && (
                      <p className="text-sm text-[#7A7A7A] mt-0.5 line-clamp-1">
                        {challenge.description}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ml-2 ${badge.color}`}>
                    {badge.icon} {badge.text}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-[#7A7A7A] mb-3">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {challenge.total_days} 天
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {String(challenge.deadline_time).substring(0, 5)} 截止
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {(challenge.participants || []).length + 1} 人
                  </span>
                </div>

                {/* 进度指示 */}
                {isActive && hasStarted && (
                  <div className="bg-[#F5F0EB] rounded-xl p-3">
                    <div className="flex items-center gap-2 text-xs text-[#7A7A7A] mb-1">
                      <Flag className="w-3.5 h-3.5" />
                      进度：{endDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} 结束
                    </div>
                    <div className="h-1.5 bg-[#E5E0DA] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#4A6FA5] rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, Math.max(0,
                            ((new Date().getTime() - new Date(challenge.start_date).getTime()) /
                              (challenge.total_days * 86400000)) * 100
                          ))}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })
        )}
      </div>

      {/* 创建挑战弹窗 */}
      <CreateChallengeModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}
