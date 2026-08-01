import { useState, useEffect } from 'react'
import { Clock, X, Pencil, Trash2, Check, Heart, Bell, BookOpen } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../authContext'

import PoetryCard from './PoetryCard'

function ago(d) {
  const m = Math.floor((new Date() - new Date(d)) / 60000)
  if (m < 1) return '刚刚'
  if (m < 60) return `${m} 分钟前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} 小时前`
  const days = Math.floor(h / 24)
  if (days === 1) return '昨天'
  if (days < 7) return `${days} 天前`
  return new Date(d).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

export default function CheckinCard({ checkin, isOwn, idx = 0, onRefresh, onRemind }) {
  const { user } = useAuth()
  const [zoom, setZoom] = useState(false)
  const [edit, setEdit] = useState(false)
  const [txt, setTxt] = useState(checkin.content)
  const [saving, setSaving] = useState(false)
  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    supabase.from('checkin_reactions').select('user_id', { count: 'exact' }).eq('checkin_id', checkin.id).then(({ count, data }) => {
      setLikes(count || 0)
      setLiked((data || []).some(r => r.user_id === user?.id))
    })
  }, [checkin.id, user?.id])

  const toggleLike = async () => {
    if (isOwn) return // 不能给自己点赞
    if (liked) {
      await supabase.from('checkin_reactions').delete().eq('checkin_id', checkin.id).eq('user_id', user.id)
      setLikes(l => l - 1); setLiked(false)
    } else {
      await supabase.from('checkin_reactions').insert({ checkin_id: checkin.id, user_id: user.id })
      setLikes(l => l + 1); setLiked(true)
    }
  }

  const del = async () => {
    if (!confirm('删除这条打卡？')) return
    await supabase.from('checkins').delete().eq('id', checkin.id)
    onRefresh?.()
  }

  const save = async () => {
    if (!txt.trim()) return
    setSaving(true)
    const { error } = await supabase.from('checkins').update({ content: txt.trim() }).eq('id', checkin.id)
    if (error) { alert('保存失败: ' + error.message); setSaving(false); return }
    setEdit(false); onRefresh?.(); setSaving(false)
  }

  return (
    <>
      <div className="card card-ink anim-up" style={{ animationDelay: `${idx * 0.04}s`, position: 'relative' }}>
        {isOwn && !edit && (
          <div style={{ position: 'absolute', bottom: 12, right: 10, display: 'flex', gap: 6 }}>
            <button onClick={() => { setTxt(checkin.content); setEdit(true) }}
              style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)', background: 'var(--white)', color: 'var(--ink-light)', cursor: 'pointer' }}>
              <Pencil size={12} /></button>
            <button onClick={del}
              style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(139,58,58,0.2)', background: 'var(--white)', color: 'var(--wine)', cursor: 'pointer' }}>
              <Trash2 size={12} /></button>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-base" style={{ background: isOwn ? 'rgba(184,149,106,0.12)' : 'rgba(184,149,106,0.06)' }}>
              {isOwn ? '📝' : '🌸'}
            </div>
            <div>
              <p className="text-sm font-bold flex items-center gap-1" style={{ color: 'var(--ink)' }}>
                {checkin.profiles?.nickname || '未知'}
                {isOwn && <span className="badge badge-gold">我</span>}
                {checkin.challenge_id && <span className="badge badge-wine">🏆 挑战</span>}
              </p>
              <p className="text-xs" style={{ color: 'var(--ink-light)' }}>{ago(checkin.created_at)}</p>
            </div>
          </div>
          <div className="badge badge-gold">
            <Clock size={12} />{checkin.duration_minutes} 分钟
          </div>
        </div>

        {edit ? (
          <div className="flex flex-col gap-2">
            <textarea className="input" value={txt} onChange={e => setTxt(e.target.value)} rows={3} autoFocus />
            <div className="flex gap-2 justify-end">
              <button className="btn btn-ghost btn-sm" onClick={() => setEdit(false)}>取消</button>
              <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}><Check size={14} />保存</button>
            </div>
          </div>
        ) : (() => {
          // 检测是否为诗歌格式 — 首页只显示简短标识，完整批注只在挑战页
          try { const d = JSON.parse(checkin.content); if (d.t === 'poetry')
            return <p className="text-sm leading-relaxed flex items-center gap-2" style={{ color: 'var(--wine)' }}>
              <BookOpen size={14} />诗歌批注 · 共 {d.poem.split('\n').length} 行
            </p>
          } catch {}
          return <p className="whitespace-pre-wrap text-sm leading-relaxed">{checkin.content}</p>
        })()}

        {checkin.image_url && (
          <div className="mt-3">
            <img src={checkin.image_url} alt="" onClick={() => setZoom(true)}
              className="w-full max-h-40 object-cover rounded cursor-pointer" style={{ border: '1px solid var(--line)' }} loading="lazy" />
          </div>
        )}

        <div className="mt-3 pt-3 flex items-center justify-between text-xs" style={{ borderTop: '1px solid var(--line)', color: 'var(--ink-light)' }}>
          <span>📅 {new Date(checkin.checkin_date).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })}</span>
          <div className="flex items-center gap-3">
            {!isOwn && (
              <button onClick={toggleLike} className="flex items-center gap-1 transition-colors" style={{ color: liked ? '#e74c3c' : 'var(--ink-light)', fontWeight: liked ? 700 : 400 }}>
                <Heart size={14} fill={liked ? '#e74c3c' : 'none'} />{likes > 0 && likes}
              </button>
            )}
            {!isOwn && onRemind && (
              <button onClick={() => onRemind(checkin.user_id)} className="flex items-center gap-1" style={{ color: 'var(--ink-light)' }} title="提醒TA打卡">
                <Bell size={13} />提醒
              </button>
            )}
          </div>
        </div>
      </div>

      {zoom && checkin.image_url && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setZoom(false)}>
          <button onClick={() => setZoom(false)} className="absolute top-4 right-4 text-white"><X size={24} /></button>
          <img src={checkin.image_url} alt="" className="max-w-full max-h-[85vh] object-contain rounded" />
        </div>
      )}
    </>
  )
}
