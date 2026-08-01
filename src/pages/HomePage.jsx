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
  const [showAll, setShowAll] = useState(true)
  const [showFriend, setShowFriend] = useState(false) // 只看对方
  const [expanded, setExpanded] = useState(false) // 折叠更早记录
  const [friendStreak, setFriendStreak] = useState(0)
  const [myStreak, setMyStreak] = useState(0)
  const [reminderCount, setReminderCount] = useState(0)
  const [friendId, setFriendId] = useState(null)

  const fetch = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data: friends } = await supabase.from('friendships').select('friend_id').eq('user_id', user.id)
      const ids = [user.id, ...(friends || []).map(f => f.friend_id)]
      const { data: checks, error } = await supabase.from('checkins').select('*').in('user_id', ids).is('challenge_id', null).order('checkin_date', { ascending: false }).limit(100)
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

  // 拉连击 + 提醒
  useEffect(() => {
    if (!user) return
    ;(async () => {
      // 找好友 ID
      const { data: friends } = await supabase.from('friendships').select('friend_id').eq('user_id', user.id)
      if (friends?.length > 0) {
        const fid = friends[0].friend_id
        setFriendId(fid)
        // 好友连击
        const { data: fChecks } = await supabase.from('checkins').select('checkin_date').eq('user_id', fid).order('checkin_date', { ascending: false })
        if (fChecks) {
          let s = 0; const today = new Date(); today.setHours(0,0,0,0)
          const set = new Set(fChecks.map(c => c.checkin_date))
          let cur = new Date(today)
          if (!set.has(cur.toISOString().split('T')[0])) cur.setDate(cur.getDate()-1)
          while (set.has(cur.toISOString().split('T')[0])) { s++; cur.setDate(cur.getDate()-1) }
          setFriendStreak(s)
        }
      }
      // 我的连击
      const { data: myChecks } = await supabase.from('checkins').select('checkin_date').eq('user_id', user.id).order('checkin_date', { ascending: false })
      if (myChecks) {
        let s = 0; const today = new Date(); today.setHours(0,0,0,0)
        const set = new Set(myChecks.map(c => c.checkin_date))
        let cur = new Date(today)
        if (!set.has(cur.toISOString().split('T')[0])) cur.setDate(cur.getDate()-1)
        while (set.has(cur.toISOString().split('T')[0])) { s++; cur.setDate(cur.getDate()-1) }
        setMyStreak(s)
      }
      // 提醒数
      const { count } = await supabase.from('reminders').select('*', { count: 'exact', head: true }).eq('to_user', user.id)
      setReminderCount(count || 0)
    })()
  }, [user, checkins])

  const handleRemind = async (targetId) => {
    await supabase.from('reminders').upsert({ from_user: user.id, to_user: targetId }, { onConflict: 'from_user,to_user' })
    alert('已发送提醒！')
  }

  const clearReminders = async () => {
    await supabase.from('reminders').delete().eq('to_user', user.id)
    setReminderCount(0)
  }

  // 筛选 + 分组
  const filtered = useMemo(() => {
    if (showFriend) return checkins.filter(c => c.user_id !== user?.id)
    if (!showAll) return checkins.filter(c => c.user_id === user?.id)
    return checkins
  }, [checkins, showAll, showFriend, user])

  const recentSet = useMemo(() => {
    const s = new Set()
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() - i)
      s.add(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`)
    }
    return s
  }, [])

  const groups = useMemo(() => {
    const byDate = {}
    filtered.forEach(c => {
      if (!byDate[c.checkin_date]) byDate[c.checkin_date] = []
      byDate[c.checkin_date].push(c)
    })
    const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a))
    const recentDates = []; const olderDates = []
    dates.forEach(d => { (recentSet.has(d) ? recentDates : olderDates).push(d) })

    const build = (list) => {
      let lastMonth = ''; const r = []
      list.forEach(date => {
        const m = date.substring(0, 7)
        if (m !== lastMonth) { r.push({ type: 'month', key: 'm-'+m, label: monthLabel(date) }); lastMonth = m }
        r.push({ type: 'date', key: 'd-'+date, date, ...dateLabel(date), checkins: byDate[date] })
      })
      return r
    }
    return { recent: build(recentDates), older: build(olderDates) }
  }, [filtered, recentSet])

  return (
    <div className="page">
      <div className="header-bar">
        <div className="flex-1">
          <h1 className="header-title">🌸 Tu Viaje Español</h1>
          <p className="header-sub">
            我 🔥{myStreak}天 · 好友 🔥{friendStreak}天
          </p>
        </div>
        <div className="flex items-center gap-1">
          {reminderCount > 0 && (
            <button onClick={clearReminders} className="btn btn-icon btn-ghost relative" title="好友提醒了你">
              <Bell size={18} style={{ color: 'var(--wine)' }} />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: 'var(--wine)' }}>{reminderCount}</span>
            </button>
          )}
          <button onClick={fetch} className="btn btn-icon btn-ghost"><RefreshCw size={18} className={loading ? 'animate-spin' : ''} /></button>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="flex items-center gap-2 px-4 pb-3" style={{ background: 'rgba(251,247,242,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--line)' }}>
        <button onClick={() => { setShowAll(true); setShowFriend(false) }} className={`btn btn-sm ${showAll && !showFriend ? 'btn-primary' : 'btn-ghost'}`}>一起看</button>
        <button onClick={() => { setShowAll(false); setShowFriend(false) }} className={`btn btn-sm ${!showAll && !showFriend ? 'btn-primary' : 'btn-ghost'}`}>只看自己</button>
        <button onClick={() => { setShowAll(false); setShowFriend(true) }} className={`btn btn-sm ${showFriend ? 'btn-primary' : 'btn-ghost'}`}>只看对方</button>
        {showAll && !showFriend && <span className="text-xs" style={{ color: 'var(--sage)', marginLeft: 'auto' }}><Users size={14} className="inline" /> 对比</span>}
        {!showAll && !showFriend && <span className="text-xs" style={{ color: 'var(--ink-light)', marginLeft: 'auto' }}>📝 个人</span>}
        {showFriend && <span className="text-xs" style={{ color: 'var(--gold-dark)', marginLeft: 'auto' }}>🌸 好友</span>}
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
            {[...groups.recent, ...(expanded ? groups.older : [])].map((g, gi) => {
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
                      <CheckinCard key={c.id} checkin={c} isOwn={c.user_id === user.id} idx={gi + i} onRefresh={fetch} onRemind={handleRemind} />
                    ))}
                  </div>
                </div>
              )
            })}
            {groups.older.length > 0 && (
              <div className="text-center mt-1 mb-2">
                <button onClick={() => setExpanded(!expanded)} className="btn btn-ghost btn-sm">
                  {expanded ? '收起更早记录 ▲' : `展开更早记录 (${groups.older.filter(g => g.type === 'date').length} 天) ▼`}
                </button>
              </div>
            )}
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
