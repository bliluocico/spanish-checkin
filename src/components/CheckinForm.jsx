import { useState, useRef } from 'react'
import { X, Image, Trash2, Sparkles, Trophy } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../authContext'

export default function CheckinForm({ isOpen, onClose, onSuccess, activeChallenge }) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [duration, setDuration] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)
  const [imgFile, setImgFile] = useState(null)
  const [imgPrev, setImgPrev] = useState(null)
  const fileRef = useRef(null)

  if (!isOpen) return null

  const close = () => { setContent(''); setDuration(''); setError(''); setOk(false); setImgFile(null); setImgPrev(null); onClose() }

  const pickImg = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!['image/jpeg','image/png','image/gif','image/webp'].includes(f.type)) { setError('仅支持 JPG/PNG/GIF/WebP'); return }
    if (f.size > 5*1024*1024) { setError('图片不超过 5MB'); return }
    setImgFile(f)
    const r = new FileReader(); r.onload = ev => setImgPrev(ev.target.result); r.readAsDataURL(f)
  }

  const upload = async () => {
    if (!imgFile) return null
    const name = `${user.id}/${Date.now()}_${imgFile.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`
    const { error } = await supabase.storage.from('checkin-images').upload(name, imgFile, { cacheControl: '3600' })
    if (error) throw error
    const { data } = supabase.storage.from('checkin-images').getPublicUrl(name)
    return data.publicUrl
  }

  const submit = async (e) => {
    e.preventDefault(); setError('')
    if (!content.trim()) { setError('请填写学习内容'); return }
    if (content.trim().length > 500) { setError('内容不能超过 500 字'); return }
    const m = parseInt(duration)
    if (!duration || isNaN(m) || m < 1 || m > 1440) { setError('学习时长应在 1-1440 分钟'); return }
    setLoading(true)
    try {
      const imageUrl = imgFile ? await upload() : null
      const { error: insertErr } = await supabase.from('checkins').insert({
        user_id: user.id, content: content.trim(), duration_minutes: m,
        checkin_date: new Date().toISOString().split('T')[0],
        image_url: imageUrl, challenge_id: activeChallenge?.id || null,
      })
      if (insertErr) throw insertErr
      setOk(true)
      setTimeout(() => { close(); onSuccess?.() }, 1200)
    } catch (err) { setError(err.message || '提交失败') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full sm:max-w-sm max-h-[90vh] overflow-y-auto p-6 rounded-t-xl sm:rounded-xl"
        style={{ background: 'var(--white)', boxShadow: '0 -4px 20px rgba(44,36,22,0.08)', animation: 'fadeUp 0.25s ease-out' }}>

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-extrabold flex items-center gap-2" style={{ color: 'var(--ink)' }}>
            <Sparkles size={20} style={{ color: 'var(--gold)' }} />今日打卡
          </h2>
          <button onClick={close} className="btn btn-icon btn-ghost"><X size={18} /></button>
        </div>

        {ok ? (
          <div className="text-center py-10 anim-up">
            <div className="text-5xl mb-3">🎉</div>
            <p className="text-xl font-extrabold" style={{ color: 'var(--ink)' }}>¡Muy bien!</p>
            <p style={{ color: 'var(--ink-light)' }}>{activeChallenge ? '挑战打卡成功！' : '打卡成功'} ✨</p>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4">
            {activeChallenge && (
              <div className="badge badge-wine" style={{ padding: '8px 12px' }}>
                <Trophy size={14} />正在挑战：{activeChallenge.title}
              </div>
            )}
            <textarea className="input" rows={4} value={content} onChange={e => { setContent(e.target.value); setError('') }}
              placeholder="今天学了什么？比如：不规则动词变位、背了30个新单词..." />
            <div className="text-right text-xs" style={{ color: 'var(--ink-light)', marginTop: -8 }}>{content.length}/500</div>

            <div className="relative">
              <input type="number" className="input" value={duration} onChange={e => { setDuration(e.target.value); setError('') }}
                placeholder="学习时长（分钟）" min={1} max={1440} />
            </div>

            <div>
              {imgPrev ? (
                <div className="relative inline-block">
                  <img src={imgPrev} alt="" className="w-20 h-20 object-cover rounded" style={{ border: '1px solid var(--line)' }} />
                  <button type="button" onClick={() => { setImgFile(null); setImgPrev(null) }}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ background: 'var(--wine)' }}>
                    <Trash2 size={10} />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-outline btn-sm">
                  <Image size={14} />添加图片（可选）
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={pickImg} className="hidden" />
            </div>

            {error && <div className="text-sm" style={{ color: 'var(--wine)', background: 'rgba(139,58,58,0.06)', padding: '8px 12px', borderRadius: 'var(--radius)' }}>{error}</div>}

            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? '提交中...' : '打卡'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
