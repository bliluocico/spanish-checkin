import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../authContext'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import FormBrutal, { FormBrutalTitle, FormBrutalInput, FormBrutalBtn, FormBrutalSep } from '../components/FormBrutal'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const usernameRef = useRef(null)
  const nicknameRef = useRef(null)

  const getValues = () => ({
    email: emailRef.current?.value?.trim() || '',
    password: passwordRef.current?.value || '',
    username: usernameRef.current?.value?.trim() || '',
    nickname: nicknameRef.current?.value?.trim() || '',
  })

  const validate = () => {
    const values = getValues()
    if (!values.email) { setError('请填写邮箱'); return false }
    if (!values.password) { setError('请填写密码'); return false }
    if (values.password.length < 6) { setError('密码至少需要 6 位'); return false }
    if (!isLogin) {
      if (!values.username) { setError('请填写用户名'); return false }
      if (!values.nickname) { setError('请填写昵称'); return false }
    }
    return values
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const values = validate()
    if (!values) return
    setLoading(true)
    setError('')
    setSuccessMsg('')
    try {
      if (isLogin) {
        await signIn(values.email, values.password)
      } else {
        const result = await signUp(values.email, values.password, values.username, values.nickname)
        if (result.user && !result.session) {
          setSuccessMsg('注册成功！请检查邮箱确认链接。')
        } else {
          setSuccessMsg('注册成功！')
        }
      }
    } catch (err) {
      if (err.message?.includes('Invalid login credentials')) setError('邮箱或密码错误')
      else if (err.message?.includes('already registered')) setError('该邮箱已被注册')
      else setError(err.message || '操作失败')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex flex-col items-center justify-center px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌸</div>
          <h1 className="text-2xl font-extrabold text-[#4A3728]">Tu Viaje Español</h1>
          <p className="text-sm text-[#8B7355] mt-1">和好朋友一起，记录西语学习之旅</p>
        </div>

        {/* 切换 */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => { setIsLogin(true); setError(''); setSuccessMsg('') }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${isLogin ? 'bg-[#2D2D2D] text-white shadow-md' : 'bg-white text-[#8B7355] border border-[#E5E0DA]'}`}>登录</button>
          <button onClick={() => { setIsLogin(false); setError(''); setSuccessMsg('') }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${!isLogin ? 'bg-[#2D2D2D] text-white shadow-md' : 'bg-white text-[#8B7355] border border-[#E5E0DA]'}`}>注册</button>
        </div>

        <FormBrutal onSubmit={handleSubmit}>
          <FormBrutalTitle sub={isLogin ? '欢迎回来' : '创建新账号'}>
            {isLogin ? '登录' : '注册'}
          </FormBrutalTitle>

          <FormBrutalInput ref={emailRef} type="email" placeholder="邮箱" onChange={() => setError('')} />

          <div className="relative">
            <FormBrutalInput ref={passwordRef} type={showPassword ? 'text' : 'password'} placeholder="密码（至少6位）" onChange={() => setError('')} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#2D2D2D]">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {!isLogin && (
            <>
              <FormBrutalSep />
              <FormBrutalInput ref={usernameRef} placeholder="用户名（英文数字）" onChange={() => setError('')} />
              <FormBrutalInput ref={nicknameRef} placeholder="显示昵称" onChange={() => setError('')} />
            </>
          )}

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </motion.div>
          )}
          {successMsg && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">{successMsg}</motion.div>
          )}

          <FormBrutalBtn type="submit" disabled={loading}>
            {loading ? '处理中...' : isLogin ? '登录' : '注册'}
          </FormBrutalBtn>
        </FormBrutal>

        <p className="text-center text-xs text-[#C4A882] mt-6">🇪🇸 ¡Aprendamos español juntos!</p>
      </motion.div>
    </div>
  )
}
