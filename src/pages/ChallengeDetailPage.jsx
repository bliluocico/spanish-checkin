import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Clock, Target, Sparkles, BookOpen, Pen, Timer, CheckCircle, XCircle, Users } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../authContext'
import CervantesBadge from '../components/CervantesBadge'
import BorgesBadge from '../components/BorgesBadge'
import DonQuixoteBadge from '../components/DonQuixoteBadge'

const TYPE_CFG = {
  word:  { icon: <BookOpen size={16} />, name: '单词挑战', goalLabel: '每天目标', goalUnit: '个词' },
  poetry: { icon: <Pen size={16} />, name: '诗歌批注', goalLabel: null, goalUnit: null },
  time:  { icon: <Timer size={16} />, name: '时长挑战', goalLabel: '每天目标', goalUnit: '分钟' },
  custom: { icon: <Target size={16} />, name: '自由挑战', goalLabel: null, goalUnit: null },
}

export default function ChallengeDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const nav = useNavigate()
  const [challenge, setChallenge] = useState(null)
  const [participants, setParticipants] = useState([])
  const [checkins, setCheckins] = useState([])
  const [loading, setLoading] = useState(true)
  const [myStatus, setMyStatus] = useState(null) // null | 'pending' | 'accepted'
  const [ckContent, setCkContent] = useState('')
  const [ckDuration, setCkDuration] = useState('')
  const [ckError, setCkError] = useState('')
  const [ckLoading, setCkLoading] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data: ch } = await supabase.from('challenges').select('*').eq('id', id).single()
      if (!ch) { nav('/challenges'); return }
      setChallenge(ch)

      const { data: parts } = await supabase.from('challenge_participants').select('*').eq('challenge_id', id)
      setParticipants(parts || [])

      // 我在这挑战里的状态
      if (ch.creator_id === user.id) {
        setMyStatus('accepted') // 创建者自动接受
      } else {
        const me = (parts || []).find(p => p.user_id === user.id)
        setMyStatus(me ? (me.accepted ? 'accepted' : 'pending') : null)
      }

      // 已接受 → 拉打卡记录
      if (ch.creator_id === user.id || (parts || []).some(p => p.user_id === user.id && p.accepted)) {
        const uids = [ch.creator_id, ...(parts || []).map(p => p.user_id)]
        const { data: checks } = await supabase.from('checkins').select('*, profiles:user_id(nickname)')
          .eq('challenge_id', id).in('user_id', uids).order('checkin_date', { ascending: false })
        setCheckins(checks || [])
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [id, nav, user.id])

  useEffect(() => { fetch() }, [fetch])

  const accept = async () => {
    await supabase.from('challenge_participants').update({ accepted: true }).eq('challenge_id', id).eq('user_id', user.id)
    await supabase.from('challenges').update({ pending: false }).eq('id', id)
    fetch()
  }

  const reject = async () => {
    if (!confirm('确定拒绝这个挑战？')) return
    await supabase.from('challenge_participants').delete().eq('challenge_id', id).eq('user_id', user.id)
    nav('/challenges')
  }

  const doCheckin = async (e) => {
    e.preventDefault(); setCkError('')
    if (!ckContent.trim()) { setCkError('请填写学习内容'); return }
    const m = parseInt(ckDuration)
    if (!ckDuration || isNaN(m) || m < 1) { setCkError('请填写学习时长'); return }
    setCkLoading(true)
    try {
      await supabase.from('checkins').insert({
        user_id: user.id, content: ckContent.trim(), duration_minutes: m,
        checkin_date: new Date().toISOString().split('T')[0], challenge_id: id,
      })
      setCkContent(''); setCkDuration(''); fetch()
    } catch (err) { setCkError(err.message) }
    finally { setCkLoading(false) }
  }

  if (loading) return <div className="page flex items-center justify-center"><div className="empty"><div className="empty-icon">🏆</div><p className="empty-sub">加载中...</p></div></div>
  if (!challenge) return null

  const cfg = TYPE_CFG[challenge.type] || TYPE_CFG.custom
  const isPending = challenge.pending && myStatus === 'pending'
  const isActive = myStatus === 'accepted' && challenge.status === 'active'

  // 每日网格
  const days = []
  const start = new Date(challenge.start_date)
  for (let i = 0; i < challenge.total_days; i++) { const d = new Date(start); d.setDate(d.getDate()+i); days.push({ date: d.toISOString().split('T')[0], n: i+1 }) }

  const g = (uid, date) => checkins.find(c => c.user_id === uid && c.checkin_date === date)
  const otherUser = participants.find(p => p.user_id !== user.id)
  const myCount = checkins.filter(c => c.user_id === user.id).length
  const otherCount = otherUser ? checkins.filter(c => c.user_id === otherUser.user_id).length : 0

  return (
    <div className="page">
      {/* 顶栏 */}
      <div className="header-bar">
        <button onClick={() => nav('/challenges')} className="btn btn-icon btn-ghost"><ArrowLeft size={18} /></button>
        <div className="flex-1"><h1 className="header-title truncate">{challenge.title}</h1>
          <p className="header-sub flex items-center gap-2">{cfg.icon} {cfg.name} · {challenge.total_days}天 · {String(challenge.deadline_time).substring(0,5)} 截止</p>
        </div>
      </div>

      {/* 待接受横幅 */}
      {isPending && (
        <div className="card text-center py-6 mx-4 mt-3 anim-up" style={{ borderColor: 'var(--gold)', borderWidth: 2 }}>
          <div className="text-4xl mb-3">📬</div>
          <p className="text-lg font-extrabold" style={{ color: 'var(--ink)' }}>新的挑战邀请</p>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-light)' }}>
            {cfg.name} · {challenge.total_days} 天
            {challenge.goal_value > 0 && ` · ${cfg.goalLabel} ${challenge.goal_value}${cfg.goalUnit}`}
          </p>
          <div className="flex gap-3 justify-center mt-4">
            <button onClick={accept} className="btn btn-primary"><CheckCircle size={16} />接受</button>
            <button onClick={reject} className="btn btn-outline"><XCircle size={16} />拒绝</button>
          </div>
        </div>
      )}

      {/* 结果 */}
      {challenge.status === 'completed' && (
        <div className="text-center py-6 anim-up">
          {challenge.winner_id === user.id ? <CervantesBadge size={100} animated showText />
          : challenge.failed_user_id === user.id ? <DonQuixoteBadge size={100} animated showText />
          : <BorgesBadge size={100} animated showText />}
        </div>
      )}

      <div className="flex flex-col gap-4 px-4 mt-4">
        {/* 进度对比 */}
        {isActive && (
          <div className="card">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Target size={14} style={{ color: 'var(--gold)' }} />双方进度</h3>
            <div className="flex items-stretch gap-4">
              <div className="flex-1 text-center">
                <div className="text-2xl">📝</div>
                <p className="text-xs font-bold mt-1">我</p>
                <p className="text-lg font-extrabold" style={{ color: 'var(--gold)' }}>{myCount}/{challenge.total_days}</p>
                <div style={{ height: 4, background: 'var(--line)', borderRadius: 2, overflow: 'hidden', marginTop: 4 }}>
                  <div style={{ height: '100%', background: 'var(--gold)', borderRadius: 2, width: `${(myCount/challenge.total_days)*100}%` }} />
                </div>
              </div>
              <div style={{ width: 1, background: 'var(--line)' }} />
              <div className="flex-1 text-center">
                <div className="text-2xl">🌸</div>
                <p className="text-xs font-bold mt-1 truncate">{otherUser ? '好友' : '—'}</p>
                <p className="text-lg font-extrabold" style={{ color: 'var(--sage)' }}>{otherCount}/{challenge.total_days}</p>
                <div style={{ height: 4, background: 'var(--line)', borderRadius: 2, overflow: 'hidden', marginTop: 4 }}>
                  <div style={{ height: '100%', background: 'var(--sage)', borderRadius: 2, width: `${(otherCount/challenge.total_days)*100}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 内嵌打卡 — 仅在已接受时显示 */}
        {isActive && (
          <div className="card" style={{ borderLeft: '3px solid var(--gold)' }}>
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Sparkles size={14} style={{ color: 'var(--gold)' }} />今日打卡</h3>
            {checkins.some(c => c.user_id === user.id && c.checkin_date === new Date().toISOString().split('T')[0]) ? (
              <div className="text-center py-3">
                <span className="badge badge-sage">✅ 今日已打卡</span>
              </div>
            ) : (
              <form onSubmit={doCheckin} className="flex flex-col gap-3">
                <textarea className="input" rows={3} value={ckContent} onChange={e => { setCkContent(e.target.value); setCkError('') }}
                  placeholder={challenge.type === 'poetry' ? '写下今天的诗歌批注...' : '今天学了什么？'} />
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="text-xs font-bold mb-1 block" style={{ color: 'var(--ink-light)' }}>学习时长（分钟）</label>
                    <div className="relative">
                      <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-light)' }} />
                      <input type="number" className="input pl-9" value={ckDuration} onChange={e => { setCkDuration(e.target.value); setCkError('') }} placeholder="45" min={1} />
                    </div>
                  </div>
                  <button type="submit" disabled={ckLoading} className="btn btn-primary btn-sm" style={{ height: 42 }}><Sparkles size={14} />打卡</button>
                </div>
                {ckError && <div className="text-xs" style={{ color: 'var(--wine)' }}>{ckError}</div>}
              </form>
            )}
          </div>
        )}

        {/* 每日记录网格 */}
        {isActive && (
          <div className="card">
            <h3 className="text-sm font-bold mb-3">每日打卡记录</h3>
            <div className="flex flex-col gap-1.5">
              {days.slice().reverse().slice(0, 14).map(day => {
                const me = g(user.id, day.date)
                const other = g(otherUser?.user_id, day.date)
                return (
                  <div key={day.date} className="flex items-center gap-2 px-3 py-1.5 rounded"
                    style={{ background: day.date === new Date().toISOString().split('T')[0] ? 'var(--parchment-deep)' : 'transparent' }}>
                    <span className="text-xs font-bold" style={{ color: 'var(--ink-light)', width: 40 }}>第{day.n}天</span>
                    <span style={{ opacity: me ? 1 : 0.25 }}>✅</span>
                    <span style={{ opacity: other ? 1 : 0.25 }}>🌸</span>
                    <span className="text-xs ml-auto" style={{ color: 'var(--ink-light)' }}>{day.date.slice(5)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
