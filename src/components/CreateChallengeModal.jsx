import { useState } from 'react'
import { X, Target, CalendarDays, Clock, Sparkles } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../authContext'

export default function CreateChallengeModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [days, setDays] = useState('')
  const [time, setTime] = useState('23:59:00')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const close = () => { setTitle(''); setDesc(''); setDays(''); setTime('23:59:00'); setError(''); onClose() }

  const submit = async (e) => {
    e.preventDefault(); setError('')
    if (!title.trim()) { setError('请填写挑战名称'); return }
    const d = parseInt(days)
    if (!days || isNaN(d) || d < 1 || d > 365) { setError('天数 1-365'); return }
    setLoading(true)
    try {
      const { data: ch, error: ce } = await supabase.from('challenges').insert({
        creator_id: user.id, title: title.trim(), description: desc.trim(),
        total_days: d, deadline_time: time, start_date: new Date().toISOString().split('T')[0],
      }).select().single()
      if (ce) throw ce

      const { data: friends } = await supabase.from('friendships').select('friend_id').eq('user_id', user.id)
      if (friends?.length > 0) {
        await supabase.from('challenge_participants').insert(friends.map(f => ({ challenge_id: ch.id, user_id: f.friend_id })))
      }
      close(); onSuccess?.()
    } catch (err) { setError(err.message || '创建失败') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full sm:max-w-sm max-h-[90vh] overflow-y-auto p-6 rounded-t-xl sm:rounded-xl"
        style={{ background: 'var(--white)', boxShadow: '0 -4px 20px rgba(44,36,22,0.08)', animation: 'fadeUp 0.25s ease-out' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-extrabold flex items-center gap-2" style={{ color: 'var(--ink)' }}><Target size={20} style={{ color: 'var(--gold)' }} />新建挑战</h2>
          <button onClick={close} className="btn btn-icon btn-ghost"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <input className="input" value={title} onChange={e => { setTitle(e.target.value); setError('') }} placeholder="挑战名称，如：30天西语冲刺" />
          <textarea className="input" rows={2} value={desc} onChange={e => setDesc(e.target.value)} placeholder="描述（可选）" />
          <div className="flex gap-3">
            <div className="flex-1"><div className="relative"><CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-light)' }} /><input type="number" className="input pl-9" value={days} onChange={e => { setDays(e.target.value); setError('') }} placeholder="天数" min={1} max={365} /></div></div>
            <div className="flex-1"><div className="relative"><Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-light)' }} /><input type="time" className="input pl-9" value={time} onChange={e => setTime(e.target.value)} /></div></div>
          </div>
          {error && <div className="text-sm" style={{ color: 'var(--wine)', background: 'rgba(139,58,58,0.06)', padding: '8px 12px', borderRadius: 'var(--radius)' }}>{error}</div>}
          <button type="submit" disabled={loading} className="btn btn-primary w-full"><Sparkles size={16} />创建挑战</button>
        </form>
      </div>
    </div>
  )
}
