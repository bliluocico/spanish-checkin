import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, BookOpen, RefreshCw, Users } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../authContext'
import CheckinCard from '../components/CheckinCard'
import CheckinForm from '../components/CheckinForm'

export default function HomePage() {
  const { user } = useAuth()
  const [checkins, setCheckins] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const fetchCheckins = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      // 获取好友列表
      const { data: friendships } = await supabase
        .from('friendships')
        .select('friend_id')
        .eq('user_id', user.id)

      const friendIds = friendships?.map(f => f.friend_id) || []

      // 获取自己和好友的打卡记录
      const userIds = [user.id, ...friendIds]

      const { data: checkinsData, error } = await supabase
        .from('checkins')
        .select('*')
        .in('user_id', userIds)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      // 获取所有相关用户的 profile（单独查询，避免外键关联问题）
      const uniqueUserIds = [...new Set((checkinsData || []).map(c => c.user_id))]
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, nickname')
        .in('id', uniqueUserIds)

      // 构建 id -> nickname 映射
      const nicknameMap = {}
      ;(profilesData || []).forEach(p => {
        nicknameMap[p.id] = p.nickname
      })

      // 把 nickname 合并到打卡数据中
      const merged = (checkinsData || []).map(c => ({
        ...c,
        profiles: { nickname: nicknameMap[c.user_id] || '未知用户' },
      }))

      setCheckins(merged)
      setFetchError('')
    } catch (err) {
      console.error('获取打卡记录失败:', err.message)
      setFetchError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchCheckins()
  }, [fetchCheckins])

  const handleNewCheckin = () => {
    fetchCheckins()
  }

  return (
    <div className="min-h-screen bg-[#F5F0EB]">
      {/* 顶部标题栏 */}
      <div className="sticky top-0 z-30 bg-[#F5F0EB]/80 backdrop-blur-xl border-b border-[#E5E0DA]/30">
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[#2D2D2D] flex items-center gap-2">
              🌸 Tu Viaje Español
            </h1>
            <p className="text-xs text-[#A0A0A0] mt-0.5">和好朋友一起学西语 ✨</p>
          </div>
          <button
            onClick={fetchCheckins}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-[#A0A0A0] hover:text-[#4A6FA5] shadow-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 打卡内容列表 */}
      <div className="px-4 py-4 space-y-3">
        {loading && checkins.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <div className="text-5xl animate-bounce mb-4">📚</div>
            <p className="text-[#A0A0A0]">加载打卡记录中...</p>
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center py-16 px-4">
            <div className="text-6xl mb-4">😵</div>
            <p className="text-[#3A5A8C] font-bold mb-2">加载失败</p>
            <p className="text-[#7A7A7A] text-sm text-center break-all">{fetchError}</p>
            <button
              onClick={fetchCheckins}
              className="mt-4 px-6 py-2 bg-[#4A6FA5] text-white rounded-xl font-bold text-sm"
            >
              重试
            </button>
          </div>
        ) : checkins.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center py-16 px-4"
          >
            <div className="text-7xl mb-6">📖</div>
            <h2 className="text-xl font-bold text-[#2D2D2D] mb-2">还没有打卡记录</h2>
            <p className="text-[#7A7A7A] text-center mb-2">
              点击下方 + 按钮，记录你的西语学习吧！
            </p>
            <p className="text-[#A0A0A0] text-sm text-center">
              🇪🇸 ¡Vamos a aprender español!
            </p>
          </motion.div>
        ) : (
          <>
            {/* 好友标记 */}
            {checkins.some(c => c.user_id !== user.id) && (
              <div className="flex items-center gap-2 px-1 mb-1">
                <Users className="w-4 h-4 text-[#6B8E6B]" />
                <span className="text-sm font-bold text-[#6B8E6B]">你和朋友的学习动态</span>
              </div>
            )}

            {checkins.map((checkin, i) => (
              <CheckinCard
                key={checkin.id}
                checkin={checkin}
                isOwn={checkin.user_id === user.id}
                index={i}
              />
            ))}
          </>
        )}
      </div>

      {/* 浮动打卡按钮 */}
      <motion.button
        onClick={() => setShowForm(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-24 right-1/2 translate-x-[calc(50%+80px)] sm:translate-x-[140px] z-40 w-14 h-14 bg-[#4A6FA5] hover:bg-[#3A5A8C] text-white rounded-lg shadow-[0_1px_4px_rgba(74,111,165,0.2)] flex items-center justify-center transition-colors duration-200"
        style={{
          boxShadow: '0 6px 24px rgba(74,111,165,0.2), 0 2px 8px rgba(74,111,165,0.12)',
        }}
      >
        <Plus className="w-7 h-7" strokeWidth={2.5} />
      </motion.button>

      {/* 打卡弹窗 */}
      <CheckinForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={handleNewCheckin}
      />
    </div>
  )
}
