import { useState, useRef } from 'react'
import { useAuth } from '../authContext'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState('')

  const emailRef = useRef(null)
  const pwRef = useRef(null)
  const userRef = useRef(null)
  const nickRef = useRef(null)

  const vals = () => ({
    email: emailRef.current?.value?.trim() || '',
    password: pwRef.current?.value || '',
    username: userRef.current?.value?.trim() || '',
    nickname: nickRef.current?.value?.trim() || '',
  })

  const validate = () => {
    const v = vals()
    if (!v.email) { setError('请填写邮箱'); return false }
    if (!v.password || v.password.length < 6) { setError('密码至少 6 位'); return false }
    if (!isLogin && !v.username) { setError('请填写用户名'); return false }
    if (!isLogin && !v.nickname) { setError('请填写昵称'); return false }
    return v
  }

  const submit = async (e) => {
    e.preventDefault()
    const v = validate()
    if (!v) return
    setLoading(true); setError(''); setOk('')
    try {
      if (isLogin) { await signIn(v.email, v.password) }
      else {
        const r = await signUp(v.email, v.password, v.username, v.nickname)
        if (r.user && !r.session) setOk('注册成功！请检查邮箱确认')
        else setOk('注册成功！')
      }
    } catch (err) {
      if (err.message?.includes('Invalid login')) setError('邮箱或密码错误')
      else if (err.message?.includes('already registered') || err.message?.includes('已被使用')) setError(err.message.includes('已被') ? err.message : '该邮箱已注册')
      else setError(err.message || '操作失败')
    } finally { setLoading(false) }
  }

  return (
    <div className="page flex flex-col items-center justify-center" style={{ paddingTop: '20vh' }}>
      <div className="text-center mb-8 anim-up">
        <div className="text-5xl mb-4">🌸</div>
        <h1 className="text-2xl font-extrabold" style={{ color: 'var(--ink)' }}>Tu Viaje Español</h1>
        <p className="text-sm mt-2" style={{ color: 'var(--ink-light)' }}>和好朋友一起，记录西语学习之旅</p>
      </div>

      {/* 切换 */}
      <div className="flex gap-2 mb-6 w-full max-w-sm anim-up anim-up-1">
        <button onClick={() => { setIsLogin(true); setError(''); setOk('') }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${isLogin ? 'btn-primary' : 'btn-outline'}`}>登录</button>
        <button onClick={() => { setIsLogin(false); setError(''); setOk('') }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${!isLogin ? 'btn-primary' : 'btn-outline'}`}>注册</button>
      </div>

      <form onSubmit={submit} className="card w-full max-w-sm flex flex-col gap-4 anim-up anim-up-2">
        <input ref={emailRef} type="email" className="input" placeholder="邮箱" onChange={() => setError('')} />

        <div className="relative">
          <input ref={pwRef} type={showPw ? 'text' : 'password'} className="input pr-10" placeholder="密码（至少6位）" onChange={() => setError('')} />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-light)' }}>
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {!isLogin && (
          <>
            <div style={{ borderTop: '1px solid var(--line)', margin: '4px 0' }} />
            <input ref={userRef} className="input" placeholder="用户名（英文和数字）" onChange={() => setError('')} />
            <input ref={nickRef} className="input" placeholder="显示昵称" onChange={() => setError('')} />
          </>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--wine)', background: 'rgba(139,58,58,0.06)', padding: '8px 12px', borderRadius: 'var(--radius)' }}>
            <AlertCircle size={16} />{error}
          </div>
        )}
        {ok && (
          <div className="text-sm" style={{ color: 'var(--sage)', background: 'rgba(107,142,107,0.08)', padding: '8px 12px', borderRadius: 'var(--radius)' }}>{ok}</div>
        )}

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? '处理中...' : isLogin ? '登录' : '注册'}
        </button>
      </form>

      <p className="text-xs mt-6" style={{ color: 'var(--ink-light)' }}>🇪🇸 ¡Aprendamos español juntos!</p>
    </div>
  )
}
