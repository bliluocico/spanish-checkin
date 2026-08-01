import { useState } from 'react'
import { X, CalendarDays, Clock, Sparkles, BookOpen, Pen, Timer, Target } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../authContext'

const TYPES = [
  { id: 'time', name: '时长挑战', icon: <Timer size={20} />, desc: '每天学够多少分钟', goalLabel: '每天目标分钟数', goalUnit: '分钟' },
  { id: 'word', name: '单词挑战', icon: <BookOpen size={20} />, desc: '每天背多少个单词', goalLabel: '每天目标单词数', goalUnit: '个' },
  { id: 'poetry', name: '诗歌批注', icon: <Pen size={20} />, desc: '每天批注一首西语诗歌', goalLabel: null, goalUnit: null },
  { id: 'custom', name: '自由挑战', icon: <Target size={20} />, desc: '自定义目标和规则', goalLabel: null, goalUnit: null },
]

export default function CreateChallengeModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth()
  const [type, setType] = useState('time')
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [goal, setGoal] = useState('')
  const [days, setDays] = useState('')
  const [deadline, setDeadline] = useState('23:59:00')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1=选类型, 2=填详情

  if (!isOpen) return null

  const t = TYPES.find(x => x.id === type)
  const hasGoal = t?.goalLabel != null

  const close = () => { setType('time'); setTitle(''); setDesc(''); setGoal(''); setDays(''); setDeadline('23:59:00'); setError(''); setStep(1); onClose() }

  const submit = async (e) => {
    e.preventDefault(); setError('')
    if (!title.trim()) { setError('请填写挑战名称'); return }
    const d = parseInt(days)
    if (!days || isNaN(d) || d < 1 || d > 365) { setError('天数 1-365'); return }
    const g = hasGoal ? parseInt(goal) : 0
    if (hasGoal && (!goal || isNaN(g) || g < 1)) { setError(`请填写${t.goalLabel}`); return }
    setLoading(true)
    try {
      const { data: ch, error: ce } = await supabase.from('challenges').insert({
        creator_id: user.id, type, title: title.trim(), description: desc.trim(),
        goal_value: g, total_days: d, deadline_time: deadline,
        start_date: `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(new Date().getDate()).padStart(2,'0')}`, pending: true,
      }).select().single()
      if (ce) throw ce

      const { data: friends } = await supabase.from('friendships').select('friend_id').eq('user_id', user.id)
      if (friends?.length > 0) {
        await supabase.from('challenge_participants').insert(
          friends.map(f => ({ challenge_id: ch.id, user_id: f.friend_id, accepted: false }))
        )
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
          <h2 className="text-lg font-extrabold" style={{ color: 'var(--ink)' }}>
            {step === 1 ? '选择挑战类型' : '填写挑战详情'}
          </h2>
          <button onClick={close} className="btn btn-icon btn-ghost"><X size={18} /></button>
        </div>

        {step === 1 ? (
          /* 第一步：选类型 */
          <div className="grid grid-cols-2 gap-3">
            {TYPES.map(ct => (
              <button key={ct.id} onClick={() => { setType(ct.id); setStep(2) }}
                className="card text-center flex flex-col items-center gap-2 py-6 cursor-pointer hover:shadow-md transition-shadow"
                style={{ border: type === ct.id ? '2px solid var(--gold)' : '1px solid var(--line)' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(184,149,106,0.1)', color: 'var(--gold)' }}>
                  {ct.icon}
                </div>
                <span className="font-bold text-sm" style={{ color: 'var(--ink)' }}>{ct.name}</span>
                <span className="text-xs" style={{ color: 'var(--ink-light)' }}>{ct.desc}</span>
              </button>
            ))}
          </div>
        ) : (
          /* 第二步：填详情 */
          <form onSubmit={submit} className="flex flex-col gap-4">
            {/* 已选类型 */}
            <div className="flex items-center gap-2 px-3 py-2 rounded" style={{ background: 'rgba(184,149,106,0.08)' }}>
              {t?.icon}<span className="text-sm font-bold" style={{ color: 'var(--gold-dark)' }}>{t?.name}</span>
              <button type="button" onClick={() => setStep(1)} className="text-xs ml-auto" style={{ color: 'var(--ink-light)' }}>修改</button>
            </div>

            <input className="input" value={title} onChange={e => { setTitle(e.target.value); setError('') }} placeholder={`挑战名称，如：${type==='word'?'30天背完800词':type==='poetry'?'西语诗歌30天':type==='time'?'30天西语冲刺':'自定义挑战'}`} />

            <textarea className="input" rows={2} value={desc} onChange={e => setDesc(e.target.value)} placeholder="描述（可选）" />

            {hasGoal && (
              <div>
                <label className="text-xs font-bold mb-1 block" style={{ color: 'var(--ink-light)' }}>{t.goalLabel}</label>
                <div className="relative">
                  <input type="number" className="input pr-12" value={goal} onChange={e => { setGoal(e.target.value); setError('') }} placeholder="0" min={1} />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: 'var(--ink-light)' }}>{t.goalUnit}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-bold mb-1 block" style={{ color: 'var(--ink-light)' }}>挑战天数</label>
                <div className="relative">
                  <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-light)' }} />
                  <input type="number" className="input pl-9" value={days} onChange={e => { setDays(e.target.value); setError('') }} placeholder="30" min={1} max={365} />
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold mb-1 block" style={{ color: 'var(--ink-light)' }}>每日截止</label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-light)' }} />
                  <input type="time" className="input pl-9" value={deadline.substring(0,5)} onChange={e => setDeadline(e.target.value + ':00')} />
                </div>
              </div>
            </div>

            {error && <div className="text-sm" style={{ color: 'var(--wine)', background: 'rgba(139,58,58,0.06)', padding: '8px 12px', borderRadius: 'var(--radius)' }}>{error}</div>}

            <button type="submit" disabled={loading} className="btn btn-primary w-full"><Sparkles size={16} />创建挑战</button>
          </form>
        )}
      </div>
    </div>
  )
}
