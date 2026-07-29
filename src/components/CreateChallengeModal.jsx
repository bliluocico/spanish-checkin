import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Target, CalendarDays, Clock, Sparkles } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../authContext'

export default function CreateChallengeModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [totalDays, setTotalDays] = useState('')
  const [deadlineTime, setDeadlineTime] = useState('23:59')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setTotalDays('')
    setDeadlineTime('23:59')
    setError('')
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('请填写挑战名称')
      return
    }
    const days = parseInt(totalDays)
    if (!totalDays || isNaN(days) || days < 1 || days > 365) {
      setError('挑战天数应在 1-365 之间')
      return
    }

    setLoading(true)
    try {
      // 1. 创建挑战
      const { data: challenge, error: createError } = await supabase
        .from('challenges')
        .insert({
          creator_id: user.id,
          title: title.trim(),
          description: description.trim(),
          total_days: days,
          deadline_time: deadlineTime,
          start_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single()

      if (createError) throw createError

      // 2. 获取好友列表
      const { data: friendships } = await supabase
        .from('friendships')
        .select('friend_id')
        .eq('user_id', user.id)

      // 3. 自动邀请所有好友
      if (friendships?.length > 0) {
        const participants = friendships.map(f => ({
          challenge_id: challenge.id,
          user_id: f.friend_id,
        }))
        await supabase.from('challenge_participants').insert(participants)
      }

      handleClose()
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.message || '创建失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-t-3xl sm:rounded-xl w-full sm:max-w-sm max-h-[90vh] overflow-y-auto p-6 shadow-[0_-1px_8px_rgba(74,111,165,0.06)]"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-extrabold text-[#2D2D2D] flex items-center gap-2">
                <Target className="w-5 h-5 text-[#4A6FA5]" />
                新建挑战
              </h2>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F0EB] text-[#7A7A7A] hover:bg-[#E5E0DA] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#2D2D2D] mb-2">
                  🎯 挑战名称
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setError('') }}
                  placeholder="如：30天西语学习冲刺"
                  className="w-full px-4 py-3 bg-[#F5F0EB] border-2 border-transparent focus:border-[#4A6FA5] rounded-lg text-[#2D2D2D] placeholder-[#A0A0A0] transition-all duration-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2D2D2D] mb-2">
                  📝 描述（可选）
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="简单描述挑战规则和目标..."
                  rows={2}
                  className="w-full px-4 py-3 bg-[#F5F0EB] border-2 border-transparent focus:border-[#4A6FA5] rounded-lg text-[#2D2D2D] placeholder-[#A0A0A0] resize-none transition-all duration-200 outline-none"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-[#2D2D2D] mb-2">
                    📅 天数
                  </label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] w-4 h-4" />
                    <input
                      type="number"
                      value={totalDays}
                      onChange={(e) => { setTotalDays(e.target.value); setError('') }}
                      placeholder="30"
                      min={1}
                      max={365}
                      className="w-full pl-10 pr-4 py-3 bg-[#F5F0EB] border-2 border-transparent focus:border-[#4A6FA5] rounded-lg text-[#2D2D2D] placeholder-[#A0A0A0] transition-all duration-200 outline-none"
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-semibold text-[#2D2D2D] mb-2">
                    ⏰ 截止时间
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] w-4 h-4" />
                    <input
                      type="time"
                      value={deadlineTime}
                      onChange={(e) => setDeadlineTime(e.target.value + ':00')}
                      className="w-full pl-10 pr-4 py-3 bg-[#F5F0EB] border-2 border-transparent focus:border-[#4A6FA5] rounded-lg text-[#2D2D2D] transition-all duration-200 outline-none"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2"
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3.5 bg-[#4A6FA5] hover:bg-[#3A5A8C] text-white font-bold rounded-lg shadow-[0_4px_16px_rgba(74,111,165,0.15)] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    创建挑战
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
