import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LogOut, BookOpen, Clock, CalendarDays, TrendingUp, Award, User } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../authContext'

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const [stats, setStats] = useState({ totalCheckins: 0, totalMinutes: 0, streak: 0 })
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

      // 获取统计数据
      const { data: checkins, error } = await supabase
        .from('checkins')
        .select('duration_minutes, checkin_date')
        .eq('user_id', user.id)
        .order('checkin_date', { ascending: false })

      if (!error && checkins) {
        const totalMinutes = checkins.reduce((sum, c) => sum + c.duration_minutes, 0)

        // 计算连续打卡天数
        let streak = 0
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const dateSet = new Set(checkins.map(c => c.checkin_date))

        let currentDate = new Date(today)
        // 如果今天没打卡，从昨天开始算
        if (!dateSet.has(currentDate.toISOString().split('T')[0])) {
          currentDate.setDate(currentDate.getDate() - 1)
        }

        while (true) {
          const dateStr = currentDate.toISOString().split('T')[0]
          if (dateSet.has(dateStr)) {
            streak++
            currentDate.setDate(currentDate.getDate() - 1)
          } else {
            break
          }
        }

        setStats({
          totalCheckins: checkins.length,
          totalMinutes,
          streak,
        })
      }

      setLoading(false)
    }

    loadProfile()
  }, [user])

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (err) {
      console.error('退出登录失败:', err.message)
    }
  }

  const statCards = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: '累计打卡',
      value: loading ? '-' : `${stats.totalCheckins} 天`,
      color: 'bg-[#FFF0EB] text-[#FF7B7B]',
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: '总学习时长',
      value: loading ? '-' : `${Math.floor(stats.totalMinutes / 60)} 时 ${stats.totalMinutes % 60} 分`,
      color: 'bg-[#FFF3E0] text-[#FF9800]',
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: '连续打卡',
      value: loading ? '-' : `${stats.streak} 天`,
      color: 'bg-[#E8F5E9] text-[#7BC67E]',
    },
  ]

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* 顶部标题栏 */}
      <div className="sticky top-0 z-30 bg-[#FFF8F0]/80 backdrop-blur-xl border-b border-[#FFE8D0]/30">
        <div className="px-5 py-4">
          <h1 className="text-2xl font-extrabold text-[#4A3728]">我的</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* 用户信息卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-[0_2px_16px_rgba(255,123,123,0.1)]"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#FFE8E0] rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
              📝
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-extrabold text-[#4A3728] truncate">{nickname}</h2>
              <p className="text-sm text-[#C4A882] flex items-center gap-1 mt-0.5">
                <User className="w-3 h-3" />
                {user?.email}
              </p>
            </div>
          </div>

          {/* 成就徽章 */}
          {stats.streak >= 7 && (
            <div className="mt-4 flex items-center gap-2 bg-[#FFF8E1] rounded-2xl px-4 py-2.5">
              <Award className="w-5 h-5 text-[#FFD93D]" />
              <span className="text-sm font-bold text-[#8B7355]">
                {stats.streak >= 30 ? '👑 钻石打卡王！' :
                 stats.streak >= 14 ? '🌟 金牌学习者！' :
                 '🔥 连续 7 天打卡！'}
              </span>
            </div>
          )}
        </motion.div>

        {/* 统计数据 */}
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

        {/* 学习日历占位（后续扩展） */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-6 shadow-[0_2px_16px_rgba(255,123,123,0.1)]"
        >
          <h3 className="font-bold text-[#4A3728] mb-3 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#FF7B7B]" />
            学习日历
          </h3>
          <p className="text-sm text-[#C4A882]">
            更多统计功能即将上线 📊 敬请期待！
          </p>
        </motion.div>

        {/* 退出登录按钮 */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={handleLogout}
          className="w-full py-3.5 bg-white border-2 border-[#FFE0E0] hover:bg-red-50 text-[#E85D5D] font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors duration-200"
        >
          <LogOut className="w-4 h-4" />
          退出登录
        </motion.button>

        <p className="text-center text-xs text-[#C4A882] pb-4">
          🇪🇸 ¡Sí se puede! · 版本 1.0
        </p>
      </div>
    </div>
  )
}
