import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Clock, Target, Sparkles } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../authContext'
import CheckinForm from '../components/CheckinForm'
import CervantesBadge from '../components/CervantesBadge'
import BorgesBadge from '../components/BorgesBadge'
import DonQuixoteBadge from '../components/DonQuixoteBadge'

export default function ChallengeDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const nav = useNavigate()
  const [challenge, setChallenge] = useState(null)
  const [participants, setParticipants] = useState([])
  const [checkins, setCheckins] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCheckin, setShowCheckin] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data: ch } = await supabase.from('challenges').select('*, creator:creator_id(nickname)').eq('id', id).single()
      if (!ch) { nav('/challenges'); return }
      setChallenge(ch)

      const { data: parts } = await supabase.from('challenge_participants').select('user_id,status').eq('challenge_id', id)
      setParticipants([{ user_id: ch.creator_id, status: 'active' }, ...(parts || [])])

      const uids = [ch.creator_id, ...(parts || []).map(p => p.user_id)]
      const { data: checks } = await supabase.from('checkins').select('*, profiles:user_id(nickname)').eq('challenge_id', id).in('user_id', uids).order('checkin_date', { ascending: false })
      setCheckins(checks || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [id, nav])

  useEffect(() => { fetch() }, [fetch])

  if (loading) return <div className="page flex items-center justify-center"><div className="empty"><div className="empty-icon">🏆</div><p className="empty-sub">加载中...</p></div></div>
  if (!challenge) return null

  const days = []
  const start = new Date(challenge.start_date)
  for (let i = 0; i < challenge.total_days; i++) { const d = new Date(start); d.setDate(d.getDate()+i); days.push({ date: d.toISOString().split('T')[0], n: i+1 }) }

  const g = (uid, date) => checkins.find(c => c.user_id === uid && c.checkin_date === date)
  const nn = (uid) => { const c = checkins.find(x => x.user_id === uid); return c?.profiles?.nickname || (uid === challenge.creator_id ? challenge.creator?.nickname : '未知') }

  return (
    <div className="page">
      <div className="header-bar">
        <button onClick={() => nav('/challenges')} className="btn btn-icon btn-ghost"><ArrowLeft size={18} /></button>
        <div className="flex-1"><h1 className="header-title truncate">{challenge.title}</h1>
          <p className="header-sub"><CalendarDays size={12} className="inline" /> {challenge.total_days}天 · <Clock size={12} className="inline" /> {String(challenge.deadline_time).substring(0,5)} 截止</p>
        </div>
        {challenge.status === 'active' && <button onClick={() => setShowCheckin(true)} className="btn btn-primary btn-sm"><Sparkles size={14} />打卡</button>}
      </div>

      <div className="flex flex-col gap-4 mt-3">
        {challenge.status === 'completed' && (
          <div className="text-center py-6 anim-up">
            {challenge.winner_id === user.id ? <CervantesBadge size={100} animated showText />
            : challenge.failed_user_id === user.id ? <DonQuixoteBadge size={100} animated showText />
            : <BorgesBadge size={100} animated showText />}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {participants.map(p => {
            const cnt = checkins.filter(c => c.user_id === p.user_id).length
            return (
              <div key={p.user_id} className="card text-center">
                <div className="text-2xl mb-1">{p.user_id === user.id ? '📝' : '🌸'}</div>
                <p className="text-sm font-bold truncate">{p.user_id === user.id ? '我' : nn(p.user_id)}</p>
                <p className="text-lg font-extrabold mt-1" style={{ color: 'var(--gold)' }}>{cnt}/{challenge.total_days}</p>
                <p className="text-xs" style={{ color: 'var(--ink-light)' }}>打卡天数</p>
              </div>
            )
          })}
        </div>

        <div className="card"><h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Target size={14} style={{ color: 'var(--gold)' }} />每日打卡记录</h3>
          <div className="flex flex-col gap-1.5">
            {days.slice().reverse().slice(0, 14).map(day => {
              const me = g(user.id, day.date)
              const friend = g(participants.find(p => p.user_id !== user.id)?.user_id, day.date)
              return (
                <div key={day.date} className="flex items-center gap-2 px-3 py-1.5 rounded" style={{ background: day.date === new Date().toISOString().split('T')[0] ? 'var(--parchment-deep)' : 'transparent' }}>
                  <span className="text-xs font-bold" style={{ color: 'var(--ink-light)', width: 40 }}>第{day.n}天</span>
                  <span style={{ opacity: me ? 1 : 0.25 }}>✅</span>
                  <span style={{ opacity: friend ? 1 : 0.25 }}>🌸</span>
                  <span className="text-xs ml-auto" style={{ color: 'var(--ink-light)' }}>{day.date.slice(5)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <CheckinForm isOpen={showCheckin} onClose={() => setShowCheckin(false)} onSuccess={fetch} activeChallenge={{ id: challenge.id, title: challenge.title }} />
    </div>
  )
}
