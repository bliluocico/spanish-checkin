import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LogOut, BookOpen, Clock, TrendingUp, Award, Medal } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../authContext'
import CervantesBadge from '../components/CervantesBadge'
import BorgesBadge from '../components/BorgesBadge'
import DonQuixoteBadge from '../components/DonQuixoteBadge'

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const [stats, setStats] = useState({ total: 0, mins: 0, streak: 0 })
  const [cs, setCs] = useState({ wins: 0, loss: 0, draw: 0 })
  const [completed, setCompleted] = useState([])
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    ;(async () => {
      const { data: prof } = await supabase.from('profiles').select('nickname').eq('id', user.id).maybeSingle()
      setNickname(prof?.nickname || user.email?.split('@')[0] || '未知')

      const { data: checks } = await supabase.from('checkins').select('duration_minutes,checkin_date').eq('user_id', user.id).order('checkin_date', { ascending: false })
      if (checks) {
        const mins = checks.reduce((s, c) => s + c.duration_minutes, 0)
        let streak = 0
        const today = new Date(); today.setHours(0,0,0,0)
        const set = new Set(checks.map(c => c.checkin_date))
        const ld = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
        let cur = new Date(today)
        if (!set.has(ld(cur))) cur.setDate(cur.getDate()-1)
        while (set.has(ld(cur))) { streak++; cur.setDate(cur.getDate()-1) }
        setStats({ total: checks.length, mins, streak })
      }

      const { data: chs } = await supabase.from('challenges').select('*').or(`creator_id.eq.${user.id},id.in.(select challenge_id from challenge_participants where user_id=eq.${user.id})`).eq('status','completed')
      if (chs) {
        let wins=0,loss=0,draw=0
        chs.forEach(c => { if (c.winner_id===user.id) wins++; else if (c.failed_user_id===user.id) loss++; else draw++ })
        setCs({ wins, loss, draw })
        setCompleted(chs.slice(0, 10))
      }
      setLoading(false)
    })()
  }, [user])

  return (
    <div className="page">
      <div className="header-bar"><h1 className="header-title">我的</h1></div>

      <div className="flex flex-col gap-4 mt-3">
        {/* 身份卡 */}
        <div className="card text-center anim-up">
          <div className="text-3xl mb-2">📝</div>
          <h2 className="text-lg font-extrabold">{nickname}</h2>
          <p className="text-xs" style={{ color: 'var(--ink-light)' }}>{user?.email}</p>
          {stats.streak >= 7 && (
            <div className="badge badge-gold mt-3" style={{ padding: '6px 14px' }}>
              <Award size={14} />{stats.streak >= 30 ? '👑 钻石打卡王！' : stats.streak >= 14 ? '🌟 金牌学习者！' : '🔥 连续 7 天打卡！'}
            </div>
          )}
        </div>

        {/* 统计 */}
        <div className="grid grid-cols-3 gap-2 anim-up anim-up-1">
          {[
            { icon: <BookOpen size={18} />, v: `${stats.total} 天`, l: '累计打卡', c: 'rgba(184,149,106,0.12)', tc: 'var(--gold)' },
            { icon: <Clock size={18} />, v: `${Math.floor(stats.mins/60)}时${stats.mins%60}分`, l: '总时长', c: 'rgba(107,142,107,0.1)', tc: 'var(--sage)' },
            { icon: <TrendingUp size={18} />, v: `${stats.streak} 天`, l: '连续打卡', c: 'rgba(139,58,58,0.08)', tc: 'var(--wine)' },
          ].map((s, i) => (
            <div key={i} className="card text-center" style={{ padding: '16px 8px' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2" style={{ background: s.c, color: s.tc }}>{s.icon}</div>
              <p className="text-sm font-extrabold">{loading ? '-' : s.v}</p>
              <p className="text-[10px]" style={{ color: 'var(--ink-light)' }}>{s.l}</p>
            </div>
          ))}
        </div>

        {/* 徽章墙 */}
        <div className="card anim-up anim-up-2">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><Medal size={16} style={{ color: 'var(--gold)' }} />我的徽章</h3>
          {completed.length === 0 ? (
            <div className="text-center py-4"><p className="text-sm" style={{ color: 'var(--ink-light)' }}>还没有获得徽章</p><p className="text-xs mt-1" style={{ color: 'var(--ink-light)' }}>完成一次挑战来获得第一枚徽章吧</p></div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {completed.map((c, i) => (
                  <motion.div key={c.id} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }} className="flex flex-col items-center">
                    {c.winner_id === user.id ? <CervantesBadge size={60} showText={false} />
                    : c.failed_user_id === user.id ? <DonQuixoteBadge size={60} showText={false} />
                    : <BorgesBadge size={60} showText={false} />}
                    <p className="text-[10px] mt-1 text-center truncate w-full">{c.title}</p>
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-center gap-4 text-xs" style={{ color: 'var(--ink-light)' }}>
                <span>🏆 {cs.wins}胜</span><span>🤝 {cs.draw}平</span><span>💔 {cs.loss}败</span><span>🎖 {completed.length}枚</span>
              </div>
            </>
          )}
        </div>

        <button onClick={() => signOut()} className="btn btn-danger w-full anim-up anim-up-3"><LogOut size={16} />退出登录</button>
        <p className="text-xs text-center pb-4" style={{ color: 'var(--ink-light)' }}>🇪🇸 ¡Sí se puede! · v2</p>
      </div>
    </div>
  )
}
