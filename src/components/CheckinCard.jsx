import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, User, X, Trash2, Pencil, Check } from 'lucide-react'
import { supabase } from '../supabase'

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

export default function CheckinCard({ checkin, isOwn, index = 0, onRefresh }) {
  const [showFullImage, setShowFullImage] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(checkin.content)
  const [saving, setSaving] = useState(false)

  const handleDelete = async () => {
    if (!confirm('确定删除这条打卡吗？')) return
    try {
      await supabase.from('checkins').delete().eq('id', checkin.id)
      if (onRefresh) onRefresh()
    } catch (err) {
      console.error('删除失败:', err.message)
    }
  }

  const handleSave = async () => {
    if (!editContent.trim()) return
    setSaving(true)
    try {
      await supabase.from('checkins').update({ content: editContent.trim() }).eq('id', checkin.id)
      setEditing(false)
      if (onRefresh) onRefresh()
    } catch (err) {
      console.error('保存失败:', err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
        className={`rounded-3xl p-5 shadow-[0_2px_16px_rgba(255,123,123,0.1)] relative group
          ${isOwn ? 'bg-white border-2 border-[#FFD93D]/30' : 'bg-white'}`}
      >
        {/* 操作按钮 — 仅自己的打卡可见 */}
        {isOwn && !editing && (
          <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => { setEditContent(checkin.content); setEditing(true) }}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-[#C4A882] hover:text-[#FF7B7B] hover:bg-[#FFF0EB] transition-colors shadow-sm"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-[#C4A882] hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

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
                  <span className="text-[10px] bg-[#FFD93D]/30 text-[#8B7355] px-1.5 py-0.5 rounded-full font-normal">我</span>
                )}
                {checkin.challenge_id && (
                  <span className="text-[10px] bg-[#FFF3E0] text-[#FF9800] px-1.5 py-0.5 rounded-full font-normal">🏆 挑战</span>
                )}
              </p>
              <p className="text-xs text-[#C4A882]">{timeAgo(checkin.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-[#FFF8F0] rounded-full px-3 py-1.5">
            <Clock className="w-3.5 h-3.5 text-[#FF7B7B]" />
            <span className="text-sm font-bold text-[#FF7B7B]">{checkin.duration_minutes} 分钟</span>
          </div>
        </div>

        {/* 内容 — 编辑 / 展示 */}
        {editing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 bg-[#FFF8F0] border-2 border-[#FF7B7B] rounded-xl text-[#4A3728] text-sm resize-none outline-none"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-xs font-bold text-[#8B7355] bg-[#FFF8F0] rounded-lg hover:bg-[#FFE8D0] transition-colors">取消</button>
              <button onClick={handleSave} disabled={saving} className="px-3 py-1.5 text-xs font-bold text-white bg-[#FF7B7B] rounded-lg hover:bg-[#E85D5D] transition-colors flex items-center gap-1 disabled:opacity-60">
                <Check className="w-3 h-3" />{saving ? '保存中' : '保存'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-[#4A3728] leading-relaxed whitespace-pre-wrap">{checkin.content}</p>
        )}

        {checkin.image_url && (
          <div className="mt-3">
            <img src={checkin.image_url} alt="学习记录" onClick={() => setShowFullImage(true)}
              className="w-full max-h-48 object-cover rounded-2xl cursor-pointer hover:opacity-90 transition-opacity border border-[#FFE8D0]" loading="lazy" />
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-[#FFF0E5]">
          <p className="text-xs text-[#C4A882]">
            📅 {new Date(checkin.checkin_date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {showFullImage && checkin.image_url && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowFullImage(false)}>
            <button onClick={() => setShowFullImage(false)} className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <motion.img initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              src={checkin.image_url} alt="学习记录大图" className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
