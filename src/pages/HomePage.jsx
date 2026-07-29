import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Users, RefreshCw, CalendarDays } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../authContext'
import CheckinCard from '../components/CheckinCard'
import CheckinForm from '../components/CheckinForm'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

function dateLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const now = new Date(); now.setHours(0,0,0,0)
  const diff = Math.floor((now - d) / 86400000)

  const month = d.getMonth() + 1
  const day = d.getDate()
  const wd = WEEKDAYS[d.getDay()]
  const short = `${month}月${day}日 周${wd}`

  if (diff === 0) return { label: '今天', full: `今天 · ${short}`, cls: 'date-today' }
  if (diff === 1) return { label: '昨天', full: `昨天 · ${short}`, cls: 'date-yesterday' }
  if (diff < 7)  return { label: `本周`, full: `${short}`, cls: 'date-thisweek' }
  return { label: short, full: short, cls: 'date-normal' }
}

function monthLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getFullYear()}年${d.getMonth() + 1}月`
}

export default function HomePage() {
  const { user } = useAuth()
  const [checkins, setCheckins] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showAll, setShowAll] = useState(true) // true=一起看, false=只看自己

  const fetch = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data: friends } = await supabase.from('friendships').select('friend_id').eq('user_id', user.id)
      const ids = [user.id, ...(friends || []).map(f => f.friend_id)]
      const { data: checks, error } = await supabase.from('checkins').select('*').in('user_id', ids).order('checkin_date', { ascending: false }).limit(100)
      if (error) throw error
      const uids = [...new Set((checks || []).map(c => c.user_id))]
      const { data: profiles } = await supabase.from('profiles').select('id, nickname').in('id', uids)
      const map = {}; (profiles || []).forEach(p => { map[p.id] = p.nickname })
      setCheckins((checks || []).map(c => ({ ...c, profiles: { nickname: map[c.user_id] || '未知' } })))
      setErr('')
    } catch (e) { setErr(e.message) }
    finally { setLoading(false) }
  }, [user])

  useEffect(() => { fetch() }, [fetch])

  // 筛选 + 分组
  const filtered = useMemo(() =>
    showAll ? checkins : checkins.filter(c => c.user_id === user?.id)
  , [checkins, showAll, user])

  const groups = useMemo(() => {
    const byDate = {}
    filtered.forEach(c => {
      if (!byDate[c.checkin_date]) byDate[c.checkin_date] = []
      byDate[c.checkin_date].push(c)
    })
    // 转为数组，按日期倒序
    const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a))
    // 计算月份边界
    let lastMonth = ''
    const result = []
    dates.forEach(date => {
      const m = date.substring(0, 7) // YYYY-MM
      if (m !== lastMonth) {
        result.push({ type: 'month', key: 'm-' + m, label: monthLabel(date) })
        lastMonth = m
      }
      result.push({ type: 'date', key: 'd-' + date, date, ...dateLabel(date), checkins: byDate[date] })
    })
    return result
  }, [filtered])

  return (
    <div className="page">
      <div className="header-bar">
        <div className="flex-1">
          <h1 className="header-title">🌸 Tu Viaje Español</h1>
          <p className="header-sub">和好朋友一起学西语</p>
        </div>
        <button onClick={fetch} className="btn btn-icon btn-ghost"><RefreshCw size={18} className={loading ? 'animate-spin' : ''} /></button>
      </div>

      {/* 筛选栏 */}
      <div className="flex items-center gap-2 px-4 pb-3" style={{ background: 'rgba(251,247,242,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--line)' }}>
        <button onClick={() => setShowAll(false)} className={`btn btn-sm ${!showAll ? 'btn-primary' : 'btn-ghost'}`}>只看自己</button>
        <button onClick={() => setShowAll(true)} className={`btn btn-sm ${showAll ? 'btn-primary' : 'btn-ghost'}`}>一起看</button>
        {showAll && <span className="text-xs" style={{ color: 'var(--sage)', marginLeft: 'auto' }}><Users size={14} className="inline" /> 对比模式</span>}
        {!showAll && <span className="text-xs" style={{ color: 'var(--ink-light)', marginLeft: 'auto' }}>📝 个人模式</span>}
      </div>

      <style>{`
        .date-today { color: var(--gold-dark); font-weight: 800; }
        .date-yesterday { color: var(--ink); font-weight: 700; }
        .date-thisweek { color: var(--ink); font-weight: 600; }
        .date-normal { color: var(--ink-light); font-weight: 600; }
      `}</style>

      <div className="flex flex-col gap-3 mt-3">
        {loading && checkins.length === 0 ? (
          <div className="empty"><div className="empty-icon">📚</div><p className="empty-sub">加载中...</p></div>
        ) : err ? (
          <div className="empty">
            <div className="empty-icon">😵</div><p className="empty-title">加载失败</p><p className="empty-sub">{err}</p>
            <button onClick={fetch} className="btn btn-primary btn-sm mt-3">重试</button>
          </div>
        ) : checkins.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📖</div><p className="empty-title">还没有打卡记录</p>
            <p className="empty-sub">点击右下角按钮，记录你的西语学习吧！</p>
          </div>
        ) : (
          <>
            {checkins.some(c => c.user_id !== user.id) && (
              <div className="flex items-center gap-2" style={{ color: 'var(--sage)' }}>
                <Users size={16} /><span className="badge badge-sage">你和朋友的学习动态</span>
              </div>
            )}
            {groups.map((g, gi) => {
              if (g.type === 'month') {
                return (
                  <div key={g.key} className="flex items-center gap-3 mt-2 mb-1 anim-up" style={{ animationDelay: '0s' }}>
                    <span className="text-xs font-extrabold tracking-wider" style={{ color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{g.label}</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
                  </div>
                )
              }
              // date group
              return (
                <div key={g.key}>
                  <div className={`flex items-center gap-2 mb-2 anim-up ${g.cls}`} style={{ fontSize: '0.8rem', animationDelay: `${gi * 0.02}s` }}>
                    <CalendarDays size={14} />
                    <span>{g.full}</span>
                    <span className="text-xs" style={{ color: 'var(--ink-light)', fontWeight: 400 }}>
                      {g.checkins.length} 条记录
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {g.checkins.map((c, i) => (
                      <CheckinCard key={c.id} checkin={c} isOwn={c.user_id === user.id} idx={gi + i} onRefresh={fetch} />
                    ))}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>

      <button onClick={() => setShowForm(true)} className="btn btn-primary btn-icon"
        style={{ position: 'fixed', bottom: 100, right: 'max(16px, calc((100vw - 640px)/2 + 16px))', zIndex: 40, width: 48, height: 48, borderRadius: '50%', boxShadow: '0 2px 12px rgba(44,36,22,0.15)' }}>
        <Plus size={24} strokeWidth={2} />
      </button>

      <CheckinForm isOpen={showForm} onClose={() => setShowForm(false)} onSuccess={fetch} />
    </div>
  )
}
