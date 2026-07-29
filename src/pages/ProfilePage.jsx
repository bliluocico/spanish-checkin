import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LogOut, BookOpen, Clock, TrendingUp, Award, User, Trophy, Swords, Medal, Flame } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../authContext'
import CervantesBadge from '../components/CervantesBadge'
import BorgesBadge from '../components/BorgesBadge'

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
    { icon: <BookOpen className="w-5 h-5" />, label: '累计打卡', value: loading ? '-' : `${stats.totalCheckins} 天`, color: 'bg-[#EBE8E5] text-[#4A6FA5]' },
    { icon: <Clock className="w-5 h-5" />, label: '总学习时长', value: loading ? '-' : `${Math.floor(stats.totalMinutes / 60)}时${stats.totalMinutes % 60}分`, color: 'bg-[#F0ECE8] text-[#8B6914]' },
    { icon: <TrendingUp className="w-5 h-5" />, label: '连续打卡', value: loading ? '-' : `${stats.streak} 天`, color: 'bg-[#E8ECE5] text-[#6B8E6B]' },
  ]

  return (
    <div className="min-h-screen bg-[#F5F0EB]">
      <div className="sticky top-0 z-30 bg-[#F5F0EB]/80 backdrop-blur-xl border-b border-[#E5E0DA]/30">
        <div className="px-5 py-4">
          <h1 className="text-2xl font-extrabold text-[#2D2D2D]">我的</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* 用户信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-[0_1px_6px_rgba(0,0,0,0.04)]"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#EBE7E3] rounded-lg flex items-center justify-center text-3xl flex-shrink-0">📝</div>
            <div className="min-w-0">
              <h2 className="text-xl font-extrabold text-[#2D2D2D] truncate">{nickname}</h2>
              <p className="text-sm text-[#A0A0A0] flex items-center gap-1 mt-0.5">
                <User className="w-3 h-3" />{user?.email}
              </p>
            </div>
          </div>
          {stats.streak >= 7 && (
            <div className="mt-4 flex items-center gap-2 bg-[#F0EDE8] rounded-lg px-4 py-2.5">
              <Award className="w-5 h-5 text-[#8B6914]" />
              <span className="text-sm font-bold text-[#7A7A7A]">
                {stats.streak >= 30 ? '👑 钻石打卡王！' : stats.streak >= 14 ? '🌟 金牌学习者！' : '🔥 连续 7 天打卡！'}
              </span>
            </div>
          )}
        </motion.div>

        {/* 学习统计 */}
        <div className="grid grid-cols-3 gap-3">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="bg-white rounded-lg p-4 shadow-[0_1px_4px_rgba(0,0,0,0.03)] text-center"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${card.color}`}>
                {card.icon}
              </div>
              <p className="text-lg font-extrabold text-[#2D2D2D]">{card.value}</p>
              <p className="text-[11px] text-[#A0A0A0]">{card.label}</p>
            </motion.div>
          ))}
        </div>

        {/* 挑战战绩 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl p-6 shadow-[0_1px_6px_rgba(0,0,0,0.04)]"
        >
          <h3 className="font-bold text-[#2D2D2D] mb-4 flex items-center gap-2">
            <Swords className="w-4 h-4 text-[#4A6FA5]" />
            我的战绩
          </h3>
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="text-center">
              <div className="text-3xl">🏆</div>
              <p className="text-lg font-extrabold text-[#2D2D2D]">{challengeStats.wins}</p>
              <p className="text-xs text-[#7A7A7A]">胜利</p>
            </div>
            <div className="text-center">
              <div className="text-3xl">🤝</div>
              <p className="text-lg font-extrabold text-[#2D2D2D]">{challengeStats.draws}</p>
              <p className="text-xs text-[#7A7A7A]">平局</p>
            </div>
            <div className="text-center">
              <div className="text-3xl">💔</div>
              <p className="text-lg font-extrabold text-[#2D2D2D]">{challengeStats.losses}</p>
              <p className="text-xs text-[#7A7A7A]">败北</p>
            </div>
          </div>

          {/* 已完成挑战历史 */}
          {completedChallenges.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-[#A0A0A0] font-semibold mb-2">挑战历史</p>
              {completedChallenges.map(c => (
                <div key={c.id} className="flex items-center gap-2 text-sm bg-[#F5F0EB] rounded-xl px-3 py-2">
                  {c.winner_id === user.id ? '🏆' : c.failed_user_id === user.id ? '💔' : '🤝'}
                  <span className="text-[#2D2D2D] font-semibold truncate flex-1">{c.title}</span>
                  <span className="text-xs text-[#A0A0A0] flex-shrink-0">{c.total_days}天</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* 成就徽章 */}
        {badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-[0_1px_6px_rgba(0,0,0,0.04)]"
          >
            <h3 className="font-bold text-[#2D2D2D] mb-4 flex items-center gap-2">
              <Medal className="w-4 h-4 text-[#8B6914]" />
              成就徽章
            </h3>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, i) => (
                <motion.div
                  key={badge.name}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.05, type: 'spring' }}
                  className="flex items-center gap-1.5 bg-[#F5F0EB] border border-[#E5E0DA] rounded-full px-3 py-1.5"
                  title={badge.desc}
                >
                  <span className="text-base">{badge.icon}</span>
                  <span className="text-xs font-bold text-[#7A7A7A]">{badge.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 退出登录 */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={handleLogout}
          className="w-full py-3.5 bg-white border-2 border-[#E8DEDE] hover:bg-red-50 text-[#3A5A8C] font-bold rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
        >
          <LogOut className="w-4 h-4" />退出登录
        </motion.button>

        <p className="text-center text-xs text-[#A0A0A0] pb-4">
          🇪🇸 ¡Sí se puede! · v2.0
        </p>
      </div>
    </div>
  )
}
