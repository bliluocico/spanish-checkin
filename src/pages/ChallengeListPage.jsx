import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Clock, Users, Flag, Trash2, RefreshCw, BookOpen, Pen, Timer, Target } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../authContext'
import CreateChallengeModal from '../components/CreateChallengeModal'
import { Asanoha } from '../components/WafuuPatterns'

export default function ChallengeListPage() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [tab, setTab] = useState('active') // 'active' | 'history'

  const fetch = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data: parts } = await supabase.from('challenge_participants').select('challenge_id').eq('user_id', user.id)
      const pids = (parts || []).map(p => p.challenge_id)
      let q = supabase.from('challenges').select('*').order('created_at', { ascending: false })
      if (pids.length > 0) q = q.or(`creator_id.eq.${user.id},id.in.(${pids.join(',')})`)
      else q = q.eq('creator_id', user.id)
      const { data: chs } = await q

      const cids = (chs || []).map(c => c.id)
      let pMap = {}
      if (cids.length > 0) {
        const { data: pp } = await supabase.from('challenge_participants').select('challenge_id,user_id,accepted').in('challenge_id', cids)
        ;(pp || []).forEach(p => { if (!pMap[p.challenge_id]) pMap[p.challenge_id] = []; pMap[p.challenge_id].push(p) })
      }

      const uids = [...new Set((chs || []).map(c => c.creator_id))]
      let nMap = {}
      if (uids.length > 0) {
        const { data: profs } = await supabase.from('profiles').select('id,nickname').in('id', uids)
        ;(profs || []).forEach(p => { nMap[p.id] = p.nickname })
      }

      setChallenges((chs || []).map(c => ({ ...c, creator: { nickname: nMap[c.creator_id] || '未知' }, participants: pMap[c.id] || [] })))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [user])

  useEffect(() => { fetch() }, [fetch])

  const del = async (id, e) => {
    e.stopPropagation()
    if (!confirm('删除这个挑战？')) return
    await supabase.from('challenges').delete().eq('id', id)
    fetch()
  }

  const TYPE_ICON = { word: <BookOpen size={14} />, poetry: <Pen size={14} />, time: <Timer size={14} />, custom: <Target size={14} /> }

  const badge = (c) => {
    if (c.pending) return { t: '⏳ 待接受', c: 'badge-wine' }
    if (c.status === 'completed') {
      if (c.winner_id === user.id) return { t: '🏆 你赢了！', c: 'badge-gold' }
      if (c.failed_user_id === user.id) return { t: '💔 败北', c: 'badge-wine' }
      return { t: '🤝 平局', c: 'badge-sage' }
    }
    return { t: '🔥 进行中', c: 'badge-gold' }
  }

  return (
    <div className="page bg-washi">
      <div className="header-bar">
        <Asanoha size={28} color="var(--sage)" opacity={0.7} />
        <div className="flex-1"><h1 className="header-title font-playfair" style={{ fontSize: '1.1rem' }}>打卡挑战</h1><p className="header-sub">和好朋友一起坚持学习</p></div>
        <button onClick={fetch} className="btn btn-icon btn-ghost"><RefreshCw size={18} className={loading ? 'animate-spin' : ''} /></button>
        <button onClick={() => setShowCreate(true)} className="btn btn-primary btn-sm">新建</button>
      </div>

      {/* 双 Tab */}
      <div className="flex gap-2 px-4 pb-3" style={{ background: 'rgba(251,247,242,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--line)' }}>
        <button onClick={() => setTab('active')} className={`btn btn-sm ${tab === 'active' ? 'btn-primary' : 'btn-ghost'}`}>进行中</button>
        <button onClick={() => setTab('history')} className={`btn btn-sm ${tab === 'history' ? 'btn-primary' : 'btn-ghost'}`}>挑战记录</button>
        {tab === 'active' && <span className="text-xs self-center ml-auto" style={{ color: 'var(--ink-light)' }}>{challenges.filter(c => c.status !== 'completed').length} 个进行中</span>}
        {tab === 'history' && <span className="text-xs self-center ml-auto" style={{ color: 'var(--ink-light)' }}>{challenges.filter(c => c.status === 'completed').length} 条记录</span>}
      </div>

      <div className="flex flex-col gap-3 mt-3">
        {loading ? <div className="empty"><div className="empty-icon">🏆</div><p className="empty-sub">加载中...</p></div>
        : challenges.filter(c => tab === 'active' ? c.status !== 'completed' : c.status === 'completed').length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🎯</div>
            {tab === 'active'
              ? <><p className="empty-title">还没有进行中的挑战</p><p className="empty-sub">创建一个打卡挑战，邀请好友一起！</p></>
              : <><p className="empty-title">还没有完成的挑战</p><p className="empty-sub">完成一个挑战后，记录会保存在这里</p></>}
            {tab === 'active' && <button onClick={() => setShowCreate(true)} className="btn btn-primary btn-sm mt-3">创建第一个挑战</button>}
          </div>
        ) : challenges.filter(c => tab === 'active' ? c.status !== 'completed' : c.status === 'completed').map((c, i) => {
          const b = badge(c)
          const end = new Date(c.start_date); end.setDate(end.getDate() + c.total_days)
          return (
            <div key={c.id} className="card card-ink anim-up" style={{ animationDelay: `${i*0.04}s`, cursor: 'pointer', position: 'relative' }}
              onClick={() => nav(`/challenges/${c.id}`)}>
              {c.creator_id === user.id && (
                <button onClick={e => del(c.id, e)} className="btn btn-icon btn-ghost" style={{ position: 'absolute', top: 8, right: 8 }}><Trash2 size={14} /></button>
              )}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-base font-extrabold truncate flex items-center gap-1.5" style={{ color: 'var(--ink)' }}>
                    <span style={{ color: 'var(--gold-dark)' }}>{TYPE_ICON[c.type] || TYPE_ICON.custom}</span>
                    {c.title}
                  </h3>
                  {c.description && <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--ink-light)' }}>{c.description}</p>}
                </div>
                <span className={`badge ${b.c}`}>{b.t}</span>
              </div>
              <div className="flex items-center gap-3 text-xs mb-3" style={{ color: 'var(--ink-light)' }}>
                <span className="flex items-center gap-1"><CalendarDays size={12} />{c.total_days} 天</span>
                <span className="flex items-center gap-1"><Clock size={12} />{String(c.deadline_time).substring(0,5)} 截止</span>
                <span className="flex items-center gap-1"><Users size={12} />{(c.participants||[]).filter(p => p.accepted).length+1} 人</span>
              </div>
              {c.status === 'active' && (
                <div style={{ background: 'var(--parchment-deep)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
                  <div className="flex items-center gap-1 text-xs mb-1" style={{ color: 'var(--ink-light)' }}><Flag size={12} />{end.toLocaleDateString('zh-CN',{month:'short',day:'numeric'})} 结束</div>
                  <div style={{ height: 3, background: 'var(--line)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--gold)', borderRadius: 3, width: `${Math.min(100,Math.max(0,((Date.now()-new Date(c.start_date).getTime())/(c.total_days*86400000))*100))}%` }} />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <CreateChallengeModal isOpen={showCreate} onClose={() => setShowCreate(false)} onSuccess={fetch} />
    </div>
  )
}
