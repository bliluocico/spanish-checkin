import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, CalendarDays, Clock, Users, CheckCircle, XCircle, Trophy, Target, Sparkles } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../authContext'
import CheckinForm from '../components/CheckinForm'
import CervantesBadge from '../components/CervantesBadge'
import BorgesBadge from '../components/BorgesBadge'

export default function ChallengeDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [challenge, setChallenge] = useState(null)
  const [participants, setParticipants] = useState([])
  const [checkins, setCheckins] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCheckin, setShowCheckin] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // 获取挑战信息
      const { data: ch } = await supabase
        .from('challenges')
        .select(`
          *,
          creator:creator_id (nickname)
        `)
        .eq('id', id)
        .single()

      if (!ch) { navigate('/challenges'); return }
      setChallenge(ch)

      // 获取参与者
      const { data: parts } = await supabase
        .from('challenge_participants')
        .select('user_id, status')
        .eq('challenge_id', id)
      setParticipants([{ user_id: ch.creator_id, status: 'active' }, ...(parts || [])])

      // 获取打卡记录
      const userIds = [ch.creator_id, ...(parts || []).map(p => p.user_id)]
      const { data: checks } = await supabase
        .from('checkins')
        .select('*, profiles:user_id(nickname)')
        .eq('challenge_id', id)
        .in('user_id', userIds)
        .order('checkin_date', { ascending: false })
      setCheckins(checks || [])
    } catch (err) {
      console.error('获取挑战详情失败:', err.message)
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // 生成每日打卡网格
  const generateDailyGrid = () => {
    if (!challenge) return []
    const start = new Date(challenge.start_date)
    const today = new Date()
    const days = []
    for (let i = 0; i < challenge.total_days; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]
      const isToday = dateStr === today.toISOString().split('T')[0]
      const isPast = d < today
      days.push({ date: dateStr, dayNum: i + 1, isToday, isPast })
    }
    return days
  }

  const getCheckinForDay = (userId, dateStr) => {
    return checkins.find(c => c.user_id === userId && c.checkin_date === dateStr)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl animate-bounce mb-4">🏆</div>
          <p className="text-[#C4A882]">加载挑战详情...</p>
        </div>
      </div>
    )
  }

  if (!challenge) return null

  const dailyGrid = generateDailyGrid()
  const isActive = challenge.status === 'active'
  const endDate = new Date(challenge.start_date)
  endDate.setDate(endDate.getDate() + challenge.total_days)

  // 获取参与者昵称
  const getNickname = (userId) => {
    const checkin = checkins.find(c => c.user_id === userId)
    return checkin?.profiles?.nickname || (userId === challenge.creator_id ? challenge.creator?.nickname : '未知用户')
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* 顶部 */}
      <div className="sticky top-0 z-30 bg-[#FFF8F0]/80 backdrop-blur-xl border-b border-[#FFE8D0]/30">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/challenges')}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-[#8B7355] shadow-sm hover:text-[#FF7B7B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-extrabold text-[#4A3728] truncate">{challenge.title}</h1>
            <div className="flex items-center gap-3 text-xs text-[#8B7355] mt-0.5">
              <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{challenge.total_days}天</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{String(challenge.deadline_time).substring(0,5)}截止</span>
            </div>
          </div>
          {isActive && (
            <button
              onClick={() => setShowCheckin(true)}
              className="px-4 py-2 bg-[#FF7B7B] text-white text-sm font-bold rounded-xl shadow-md hover:bg-[#E85D5D] transition-colors flex items-center gap-1 flex-shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              打卡
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* 挑战结果 */}
        {challenge.status === 'completed' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center py-6"
          >
            {challenge.winner_id === user.id ? (
              <CervantesBadge size={100} animated showText />
            ) : challenge.failed_user_id === user.id ? (
              <div className="text-center">
                <div className="text-6xl mb-3">💔</div>
                <p className="text-lg font-bold text-[#E85D5D]">挑战失败</p>
                <p className="text-sm text-[#8B7355] mt-1">失败徽章待定中...</p>
              </div>
            ) : (
              <BorgesBadge size={100} animated showText />
            )}
          </motion.div>
        )}

        {/* 参与者状态卡片 */}
        <div className="grid grid-cols-2 gap-3">
          {participants.map((p) => {
            const userChecks = checkins.filter(c => c.user_id === p.user_id)
            const isCurrentUser = p.user_id === user.id
            return (
              <motion.div
                key={p.user_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl p-4 text-center ${
                  isCurrentUser ? 'bg-white border-2 border-[#FFD93D]/40' : 'bg-white'
                }`}
              >
                <div className="text-2xl mb-1">{isCurrentUser ? '📝' : '🌸'}</div>
                <p className="text-sm font-bold text-[#4A3728] truncate">
                  {isCurrentUser ? '我' : getNickname(p.user_id)}
                </p>
                <p className="text-lg font-extrabold text-[#FF7B7B] mt-1">
                  {userChecks.length} / {challenge.total_days}
                </p>
                <p className="text-[10px] text-[#C4A882]">打卡天数</p>
                {challenge.status === 'completed' && (
                  <div className="mt-2">
                    {challenge.winner_id === p.user_id && <span className="text-xs bg-[#FFF9C4] px-2 py-0.5 rounded-full">🏆 胜出</span>}
                    {challenge.failed_user_id === p.user_id && <span className="text-xs bg-[#FFEBEE] px-2 py-0.5 rounded-full">💔 败北</span>}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* 每日打卡网格 */}
        <div className="bg-white rounded-3xl p-4 shadow-[0_2px_12px_rgba(255,123,123,0.08)]">
          <h3 className="text-sm font-bold text-[#4A3728] mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-[#FF7B7B]" />
            每日打卡记录
          </h3>
          <div className="space-y-2">
            {dailyGrid.slice().reverse().slice(0, 14).map((day) => {
              const myCheckin = getCheckinForDay(user.id, day.date)
              const friendCheckin = getCheckinForDay(
                participants.find(p => p.user_id !== user.id)?.user_id,
                day.date
              )
              return (
                <div key={day.date} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                  day.isToday ? 'bg-[#FFF3E0]' : day.isPast ? 'bg-[#FAFAFA]' : 'bg-[#F5F5F5]'
                }`}>
                  <span className="text-xs font-bold text-[#8B7355] w-8 text-center">
                    第{day.dayNum}天
                  </span>
                  <span className={`text-xl ${myCheckin ? '' : 'opacity-30'}`}>
                    ✅
                  </span>
                  <span className={`text-xl ${friendCheckin ? '' : 'opacity-30'}`}>
                    🌸
                  </span>
                  <span className="text-[10px] text-[#C4A882] ml-auto">
                    {day.date}
                  </span>
                </div>
              )
            })}
            {dailyGrid.length > 14 && (
              <p className="text-xs text-center text-[#C4A882] mt-2">
                仅显示最近 14 天，共 {challenge.total_days} 天
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 打卡弹窗（带挑战关联） */}
      <CheckinForm
        isOpen={showCheckin}
        onClose={() => setShowCheckin(false)}
        onSuccess={fetchData}
        activeChallenge={{ id: challenge.id, title: challenge.title }}
      />
    </div>
  )
}
