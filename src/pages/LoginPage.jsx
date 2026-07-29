import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../authContext'
import { Eye, EyeOff, LogIn, UserPlus, Mail, Lock, User, Smile, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  // 用 ref 代替 state，兼容中文输入法
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
    if (!values.email) {
      setError('请填写邮箱')
      return false
    }
    if (!values.password) {
      setError('请填写密码')
      return false
    }
    if (values.password.length < 6) {
      setError('密码至少需要 6 位')
      return false
    }
    if (!isLogin) {
      if (!values.username) {
        setError('请填写用户名')
        return false
      }
      if (!values.nickname) {
        setError('请填写昵称')
        return false
      }
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
          setSuccessMsg('注册成功！请检查邮箱确认链接。如果没收到邮件，请告诉我，我去后台关掉邮箱验证。')
        } else {
          setSuccessMsg('注册成功！')
        }
      }
    } catch (err) {
      if (err.message?.includes('Invalid login credentials')) {
        setError('邮箱或密码错误')
      } else if (err.message?.includes('already registered') || err.message?.includes('already been registered')) {
        setError('该邮箱已被注册，请直接登录')
      } else if (err.message?.includes('email')) {
        setError('邮箱格式不正确')
      } else {
        setError(err.message || '操作失败，请稍后再试')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F0EB] flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-6xl mb-4"
          >
            🌸
          </motion.div>
          <h1 className="text-3xl font-extrabold text-[#2D2D2D] mb-2">
            Tu Viaje Español
          </h1>
          <p className="text-[#7A7A7A] text-sm">和好朋友一起，记录西语学习之旅 ✨</p>
        </div>

        {/* 切换按钮 */}
        <div className="flex bg-white rounded-lg p-1 mb-6 shadow-sm">
          <button
            onClick={() => { setIsLogin(true); setError(''); setSuccessMsg('') }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isLogin ? 'bg-[#4A6FA5] text-white shadow-md' : 'text-[#7A7A7A]'
            }`}
          >
            登录
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); setSuccessMsg('') }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              !isLogin ? 'bg-[#4A6FA5] text-white shadow-md' : 'text-[#7A7A7A]'
            }`}
          >
            注册
          </button>
        </div>

        {/* 表单 */}
        <motion.form
          key={isLogin ? 'login' : 'register'}
          initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(74,111,165,0.05)] space-y-4"
        >
          {/* 邮箱 */}
          <div>
            <label className="block text-sm font-semibold text-[#2D2D2D] mb-1.5">邮箱</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] w-4 h-4" />
              <input
                ref={emailRef}
                type="email"
                placeholder="your@email.com"
                onChange={() => setError('')}
                className="w-full pl-10 pr-4 py-3 bg-[#F5F0EB] border-2 border-transparent focus:border-[#4A6FA5] rounded-lg text-[#2D2D2D] placeholder-[#A0A0A0] transition-all duration-200 outline-none"
              />
            </div>
          </div>

          {/* 密码 */}
          <div>
            <label className="block text-sm font-semibold text-[#2D2D2D] mb-1.5">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] w-4 h-4" />
              <input
                ref={passwordRef}
                type={showPassword ? 'text' : 'password'}
                placeholder="至少 6 位"
                onChange={() => setError('')}
                className="w-full pl-10 pr-12 py-3 bg-[#F5F0EB] border-2 border-transparent focus:border-[#4A6FA5] rounded-lg text-[#2D2D2D] placeholder-[#A0A0A0] transition-all duration-200 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-[#7A7A7A] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 注册额外字段 */}
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-semibold text-[#2D2D2D] mb-1.5">用户名</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] w-4 h-4" />
                  <input
                    ref={usernameRef}
                    type="text"
                    placeholder="英文和数字，如 xiaomei2024"
                    onChange={() => setError('')}
                    className="w-full pl-10 pr-4 py-3 bg-[#F5F0EB] border-2 border-transparent focus:border-[#4A6FA5] rounded-lg text-[#2D2D2D] placeholder-[#A0A0A0] transition-all duration-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2D2D2D] mb-1.5">昵称</label>
                <div className="relative">
                  <Smile className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] w-4 h-4" />
                  <input
                    ref={nicknameRef}
                    type="text"
                    placeholder="在打卡中显示的名字"
                    onChange={() => setError('')}
                    className="w-full pl-10 pr-4 py-3 bg-[#F5F0EB] border-2 border-transparent focus:border-[#4A6FA5] rounded-lg text-[#2D2D2D] placeholder-[#A0A0A0] transition-all duration-200 outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* 错误提示 */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          {/* 成功提示 */}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-green-600 bg-green-50 rounded-xl px-3 py-2"
            >
              {successMsg}
            </motion.div>
          )}

          {/* 提交按钮 */}
          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3.5 bg-[#4A6FA5] hover:bg-[#3A5A8C] text-white font-bold rounded-lg shadow-[0_4px_16px_rgba(74,111,165,0.15)] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isLogin ? (
              <>
                <LogIn className="w-4 h-4" />
                登录
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                注册
              </>
            )}
          </motion.button>
        </motion.form>

        <p className="text-center text-xs text-[#A0A0A0] mt-6">
          🇪🇸 ¡Aprendamos español juntos!
        </p>
      </motion.div>
    </div>
  )
}
