import { motion } from 'framer-motion'
import { Clock, User } from 'lucide-react'

// 相对时间格式化
function timeAgo(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return '刚刚'
  if (diffMin < 60) return `${diffMin} 分钟前`
  if (diffHour < 24) return `${diffHour} 小时前`
  if (diffDay === 1) return '昨天'
  if (diffDay < 7) return `${diffDay} 天前`
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

export default function CheckinCard({ checkin, isOwn, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
      className={`rounded-3xl p-5 shadow-[0_2px_16px_rgba(255,123,123,0.1)]
        ${isOwn ? 'bg-white border-2 border-[#FFD93D]/30' : 'bg-white'}`}
    >
      {/* 顶部：用户信息和时间 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg
            ${isOwn ? 'bg-[#FFF3CD]' : 'bg-[#FFE8E0]'}`}
          >
            {isOwn ? '📝' : '🌸'}
          </div>
          <div>
            <p className="text-sm font-bold text-[#4A3728] flex items-center gap-1">
              <User className="w-3 h-3" />
              {checkin.profiles?.nickname || '未知用户'}
              {isOwn && (
                <span className="text-[10px] bg-[#FFD93D]/30 text-[#8B7355] px-1.5 py-0.5 rounded-full font-normal">
                  我
                </span>
              )}
            </p>
            <p className="text-xs text-[#C4A882]">{timeAgo(checkin.created_at)}</p>
          </div>
        </div>

        {/* 时长徽章 */}
        <div className="flex items-center gap-1 bg-[#FFF8F0] rounded-full px-3 py-1.5">
          <Clock className="w-3.5 h-3.5 text-[#FF7B7B]" />
          <span className="text-sm font-bold text-[#FF7B7B]">{checkin.duration_minutes} 分钟</span>
        </div>
      </div>

      {/* 学习内容 */}
      <p className="text-[#4A3728] leading-relaxed whitespace-pre-wrap">
        {checkin.content}
      </p>

      {/* 底部日期 */}
      <div className="mt-3 pt-3 border-t border-[#FFF0E5]">
        <p className="text-xs text-[#C4A882]">
          📅 {new Date(checkin.checkin_date).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'short',
          })}
        </p>
      </div>
    </motion.div>
  )
}
