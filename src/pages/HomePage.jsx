import { useState, useEffect, useCallback } from 'react'
import { Plus, Users, RefreshCw } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../authContext'
import CheckinCard from '../components/CheckinCard'
import CheckinForm from '../components/CheckinForm'

export default function HomePage() {
  const { user } = useAuth()
  const [checkins, setCheckins] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [showForm, setShowForm] = useState(false)

  const fetch = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data: friends } = await supabase.from('friendships').select('friend_id').eq('user_id', user.id)
      const ids = [user.id, ...(friends || []).map(f => f.friend_id)]

      const { data: checks, error } = await supabase.from('checkins').select('*').in('user_id', ids).order('created_at', { ascending: false }).limit(50)
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

  return (
    <div className="page">
      <div className="header-bar">
        <div className="flex-1">
          <h1 className="header-title">🌸 Tu Viaje Español</h1>
          <p className="header-sub">和好朋友一起学西语</p>
        </div>
        <button onClick={fetch} className="btn btn-icon btn-ghost"><RefreshCw size={18} className={loading ? 'animate-spin' : ''} /></button>
      </div>

      <div className="flex flex-col gap-3 mt-3">
        {loading && checkins.length === 0 ? (
          <div className="empty"><div className="empty-icon">📚</div><p className="empty-sub">加载中...</p></div>
        ) : err ? (
          <div className="empty">
            <div className="empty-icon">😵</div>
            <p className="empty-title">加载失败</p>
            <p className="empty-sub">{err}</p>
            <button onClick={fetch} className="btn btn-primary btn-sm mt-3">重试</button>
          </div>
        ) : checkins.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📖</div>
            <p className="empty-title">还没有打卡记录</p>
            <p className="empty-sub">点击右下角按钮，记录你的西语学习吧！</p>
          </div>
        ) : (
          <>
            {checkins.some(c => c.user_id !== user.id) && (
              <div className="flex items-center gap-2" style={{ color: 'var(--sage)' }}>
                <Users size={16} /><span className="badge badge-sage">你和朋友的学习动态</span>
              </div>
            )}
            {checkins.map((c, i) => <CheckinCard key={c.id} checkin={c} isOwn={c.user_id === user.id} idx={i} onRefresh={fetch} />)}
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
