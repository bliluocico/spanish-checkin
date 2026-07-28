import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // 确保用户有 profile 记录（防止触发器失败的情况）
  const ensureProfile = useCallback(async (userId, username, nickname) => {
    if (!userId) return
    try {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle()

      if (!existing) {
        // profile 不存在，尝试创建
        const finalUsername = username || 'user_' + userId.substring(0, 8)
        const finalNickname = nickname || '未命名'

        let { error: insertError } = await supabase.from('profiles').insert({
          id: userId,
          username: finalUsername,
          nickname: finalNickname,
        })

        // 如果用户名已被占用，加随机后缀
        if (insertError?.message?.includes('unique') || insertError?.code === '23505') {
          const fallbackUsername = finalUsername + '_' + Math.random().toString(36).substring(2, 6)
          const { error: retryError } = await supabase.from('profiles').insert({
            id: userId,
            username: fallbackUsername,
            nickname: finalNickname,
          })
          if (retryError) console.warn('创建 profile 失败(重试):', retryError.message)
        } else if (insertError) {
          console.warn('创建 profile 失败:', insertError.message)
        }
      }
    } catch (err) {
      console.warn('检查 profile 失败:', err.message)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        const meta = u.user_metadata || {}
        ensureProfile(u.id, meta.username, meta.nickname)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        const meta = u.user_metadata || {}
        ensureProfile(u.id, meta.username, meta.nickname)
      }
    })

    return () => subscription.unsubscribe()
  }, [ensureProfile])

  const signUp = async (email, password, username, nickname) => {
    // 先检查用户名是否已被占用
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle()

    if (existingUser) {
      throw new Error('该用户名已被使用，请换一个')
    }

    // 注册
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, nickname },
      },
    })
    if (error) throw error

    // 确保 profile 被创建
    if (data.user) {
      await ensureProfile(data.user.id, username, nickname)
    }

    return data
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error

    // 登录后补充 profile
    if (data.user) {
      const meta = data.user.user_metadata || {}
      await ensureProfile(data.user.id, meta.username, meta.nickname)
    }

    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth 必须在 AuthProvider 内使用')
  }
  return context
}
