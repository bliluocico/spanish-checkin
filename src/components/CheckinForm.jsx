import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, BookOpen, Sparkles } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../authContext'

const MAX_CONTENT_LENGTH = 500
const MIN_DURATION = 1
const MAX_DURATION = 1440

export default function CheckinForm({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [duration, setDuration] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleClose = useCallback(() => {
    setContent('')
    setDuration('')
    setError('')
    setShowSuccess(false)
    onClose()
  }, [onClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // 验证
    const trimmedContent = content.trim()
    if (!trimmedContent) {
      setError('请填写今天学了什么内容')
      return
    }
    if (trimmedContent.length > MAX_CONTENT_LENGTH) {
      setError(`内容不能超过 ${MAX_CONTENT_LENGTH} 字`)
      return
    }

    const minutes = parseInt(duration)
    if (!duration || isNaN(minutes)) {
      setError('请填写学习时长')
      return
    }
    if (minutes < MIN_DURATION || minutes > MAX_DURATION) {
      setError(`学习时长应在 ${MIN_DURATION} 到 ${MAX_DURATION} 分钟之间`)
      return
    }

    setLoading(true)
    try {
      const { error: insertError } = await supabase.from('checkins').insert({
        user_id: user.id,
        content: trimmedContent,
        duration_minutes: minutes,
        checkin_date: new Date().toISOString().split('T')[0],
      })

      if (insertError) throw insertError

      // 成功动画
      setShowSuccess(true)
      setTimeout(() => {
        handleClose()
        if (onSuccess) onSuccess()
      }, 1500)
    } catch (err) {
      setError(err.message || '提交失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* 弹窗卡片 */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm max-h-[90vh] overflow-y-auto p-6 shadow-[0_-4px_24px_rgba(255,123,123,0.15)]"
          >
            {showSuccess ? (
              /* 成功动画 */
              <div className="flex flex-col items-center py-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10, stiffness: 200 }}
                  className="text-7xl mb-4"
                >
                  🎉
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-extrabold text-[#4A3728] mb-2"
                >
                  ¡Muy bien!
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-[#8B7355]"
                >
                  打卡成功 ✨
                </motion.p>
                {/* 星星动画 */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                      x: (Math.random() - 0.5) * 150,
                      y: (Math.random() - 0.5) * 150,
                    }}
                    transition={{ delay: 0.2 + i * 0.08, duration: 1.2 }}
                    className="absolute text-2xl"
                    style={{
                      top: '40%',
                      left: '50%',
                    }}
                  >
                    {['⭐', '🌟', '✨', '💫', '🌺', '📚'][i]}
                  </motion.div>
                ))}
              </div>
            ) : (
              <>
                {/* 标题栏 */}
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-extrabold text-[#4A3728] flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#FF7B7B]" />
                    今日打卡
                  </h2>
                  <button
                    onClick={handleClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FFF8F0] text-[#8B7355] hover:bg-[#FFE8D0] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* 学习内容 */}
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3728] mb-2">
                      📖 今天学了什么？
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => { setContent(e.target.value); setError('') }}
                      placeholder="比如：学了不规则动词变位、背了30个新单词、练了听力..."
                      rows={4}
                      className="w-full px-4 py-3 bg-[#FFF8F0] border-2 border-transparent focus:border-[#FF7B7B] rounded-2xl text-[#4A3728] placeholder-[#C4A882] resize-none transition-all duration-200 outline-none"
                    />
                    <div className="text-right text-xs text-[#C4A882] mt-1">
                      {content.length}/{MAX_CONTENT_LENGTH}
                    </div>
                  </div>

                  {/* 学习时长 */}
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3728] mb-2">
                      ⏱️ 学了多少分钟？
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4A882] w-4 h-4" />
                      <input
                        type="number"
                        value={duration}
                        onChange={(e) => { setDuration(e.target.value); setError('') }}
                        placeholder="例如：45"
                        min={MIN_DURATION}
                        max={MAX_DURATION}
                        className="w-full pl-10 pr-16 py-3 bg-[#FFF8F0] border-2 border-transparent focus:border-[#FF7B7B] rounded-2xl text-[#4A3728] placeholder-[#C4A882] transition-all duration-200 outline-none"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#8B7355] font-semibold">
                        分钟
                      </span>
                    </div>
                  </div>

                  {/* 错误提示 */}
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2"
                    >
                      {error}
                    </motion.p>
                  )}

                  {/* 提交按钮 */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3.5 bg-[#FF7B7B] hover:bg-[#E85D5D] text-white font-bold rounded-2xl shadow-[0_4px_16px_rgba(255,123,123,0.35)] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        打卡
                      </>
                    )}
                  </motion.button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
