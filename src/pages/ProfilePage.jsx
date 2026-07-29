import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LogOut, BookOpen, Clock, TrendingUp, Award, User, Trophy, Swords, Medal, Flame } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../authContext'
import CervantesBadge from '../components/CervantesBadge'
import BorgesBadge from '../components/BorgesBadge'
import DonQuixoteBadge from '../components/DonQuixoteBadge'
import CardSplit from '../components/CardSplit'
import CardGlow from '../components/CardGlow'

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const [stats, setStats] = useState({ totalCheckins: 0, totalMinutes: 0, streak: 0 })
  const [challengeStats, setChallengeStats] = useState({ wins: 0, losses: 0, draws: 0 })
  const [completedChallenges, setCompletedChallenges] = useState([])
  const [badges, setBadges] = useState([])
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      if (!user) return

      // 获取 profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('id', user.id)
        .maybeSingle()

      setNickname(profile?.nickname || user.email?.split('@')[0] || '未知用户')

      // 打卡统计
      const { data: checkins, error } = await supabase
        .from('checkins')
        .select('duration_minutes, checkin_date')
        .eq('user_id', user.id)
        .order('checkin_date', { ascending: false })

      if (!error && checkins) {
        const totalMinutes = checkins.reduce((sum, c) => sum + c.duration_minutes, 0)
        let streak = 0
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const dateSet = new Set(checkins.map(c => c.checkin_date))
        let currentDate = new Date(today)
        if (!dateSet.has(currentDate.toISOString().split('T')[0])) {
          currentDate.setDate(currentDate.getDate() - 1)
        }
        while (true) {
          const dateStr = currentDate.toISOString().split('T')[0]
          if (dateSet.has(dateStr)) { streak++; currentDate.setDate(currentDate.getDate() - 1) }
          else break
        }
        setStats({ totalCheckins: checkins.length, totalMinutes, streak })
      }

      // 挑战统计
      const { data: challenges } = await supabase
        .from('challenges')
        .select('*')
        .or(`creator_id.eq.${user.id},id.in.(select challenge_id from challenge_participants where user_id=eq.${user.id})`)
        .eq('status', 'completed')

      if (challenges) {
        let wins = 0, losses = 0, draws = 0
        challenges.forEach(c => {
          if (c.winner_id === user.id) wins++
          else if (c.failed_user_id === user.id) losses++
          else draws++
        })
        setChallengeStats({ wins, losses, draws })
        setCompletedChallenges(challenges.slice(0, 10))
      }

      // 生成成就徽章
      const badgeList = []
      if (stats.streak >= 7) badgeList.push({ icon: '🔥', name: '连续7天', desc: '连续打卡7天' })
      if (stats.streak >= 14) badgeList.push({ icon: '⚡', name: '连续14天', desc: '连续打卡14天' })
      if (stats.streak >= 30) badgeList.push({ icon: '👑', name: '王者连胜', desc: '连续打卡30天' })
      if (stats.totalCheckins >= 10) badgeList.push({ icon: '📚', name: '初学者', desc: '累计打卡10次' })
      if (stats.totalCheckins >= 50) badgeList.push({ icon: '📖', name: '学霸', desc: '累计打卡50次' })
      if (stats.totalCheckins >= 100) badgeList.push({ icon: '🎓', name: '大师', desc: '累计打卡100次' })
      if (challengeStats.wins >= 1) badgeList.push({ icon: '🏆', name: '首胜', desc: '赢得第一次挑战' })
      if (challengeStats.wins >= 3) badgeList.push({ icon: '🥇', name: '三冠王', desc: '赢得3次挑战' })
      if (challenges && challenges.filter(c => c.status === 'completed' && (c.winner_id === user.id || c.failed_user_id !== user.id)).length >= 1) {
        badgeList.push({ icon: '💪', name: '全勤挑战', desc: '完成一次挑战没失败' })
      }
      setBadges(badgeList)

      setLoading(false)
    }
    loadProfile()
  }, [user, stats.streak, stats.totalCheckins, challengeStats.wins])

  const handleLogout = async () => {
    try { await signOut() } catch (err) { console.error('退出登录失败:', err.message) }
  }

  const statCards = [
    { icon: <BookOpen className="w-5 h-5" />, label: '累计打卡', value: loading ? '-' : `${stats.totalCheckins} 天`, color: 'bg-[#FFF0EB] text-[#FF7B7B]' },
    { icon: <Clock className="w-5 h-5" />, label: '总学习时长', value: loading ? '-' : `${Math.floor(stats.totalMinutes / 60)}时${stats.totalMinutes % 60}分`, color: 'bg-[#FFF3E0] text-[#FF9800]' },
    { icon: <TrendingUp className="w-5 h-5" />, label: '连续打卡', value: loading ? '-' : `${stats.streak} 天`, color: 'bg-[#E8F5E9] text-[#7BC67E]' },
  ]

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <div className="sticky top-0 z-30 bg-[#FFF8F0]/80 backdrop-blur-xl border-b border-[#FFE8D0]/30">
        <div className="px-5 py-4">
          <h1 className="text-2xl font-extrabold text-[#4A3728]">我的</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* 用户信息 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
          <CardSplit name={nickname} sub={user?.email} className="max-w-[200px]" />
        </motion.div>
        {stats.streak >= 7 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-2 bg-[#FFF8E1] rounded-xl px-4 py-2.5 justify-center">
            <Award className="w-5 h-5 text-[#FFD93D]" />
            <span className="text-sm font-bold text-[#8B7355]">
              {stats.streak >= 30 ? '👑 钻石打卡王！' : stats.streak >= 14 ? '🌟 金牌学习者！' : '🔥 连续 7 天打卡！'}
            </span>
          </motion.div>
        )}

        {/* 学习统计 */}
        <div className="grid grid-cols-3 gap-3">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(255,123,123,0.08)] text-center"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${card.color}`}>
                {card.icon}
              </div>
              <p className="text-lg font-extrabold text-[#4A3728]">{card.value}</p>
              <p className="text-[11px] text-[#C4A882]">{card.label}</p>
            </motion.div>
          ))}
        </div>

        {/* 我的徽章 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <CardGlow>
          <h3 className="font-bold text-[#4A3728] mb-4 flex items-center gap-2">
            <Medal className="w-4 h-4 text-[#FFD93D]" />
            我的徽章
          </h3>

          {completedChallenges.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3 opacity-30">🏅</div>
              <p className="text-sm text-[#C4A882]">还没有获得徽章</p>
              <p className="text-xs text-[#C4A882] mt-1">完成一次挑战来获得第一枚徽章吧</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3" style={{ maxHeight: 'none' }}>
              {completedChallenges.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 * i, type: 'spring' }}
                  className="flex flex-col items-center"
                >
                  {c.winner_id === user.id ? (
                    <CervantesBadge size={72} showText={false} />
                  ) : c.failed_user_id === user.id ? (
                    <DonQuixoteBadge size={72} showText={false} />
                  ) : (
                    <BorgesBadge size={72} showText={false} />
                  )}
                  <p className="text-[10px] text-[#8B7355] mt-1 text-center truncate w-full">{c.title}</p>
                  <p className="text-[9px] text-[#C4A882]">{c.total_days}天</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* 徽章统计小字 */}
          {completedChallenges.length > 0 && (
            <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-[#FFF0E5]">
              <span className="text-xs text-[#8B7355]">🏆 {challengeStats.wins}胜</span>
              <span className="text-xs text-[#8B7355]">🤝 {challengeStats.draws}平</span>
              <span className="text-xs text-[#8B7355]">💔 {challengeStats.losses}败</span>
              <span className="text-xs text-[#8B7355]">🎖 {completedChallenges.length}枚</span>
            </div>
          )}
          </CardGlow>
        </motion.div>

        {/* 退出登录 */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={handleLogout}
          className="w-full py-3.5 bg-white border-2 border-[#FFE0E0] hover:bg-red-50 text-[#E85D5D] font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors duration-200"
        >
          <LogOut className="w-4 h-4" />退出登录
        </motion.button>

        <p className="text-center text-xs text-[#C4A882] pb-4">
          🇪🇸 ¡Sí se puede! · v2.0
        </p>
      </div>
    </div>
  )
}
