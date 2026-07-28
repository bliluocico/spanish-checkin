-- ============================================
-- 西语学习打卡平台 — Supabase 数据库初始化
-- 在 Supabase 后台的 SQL Editor 中执行本文件
-- ============================================

-- 1. 创建 profiles 表（用户信息）
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL,
  nickname    TEXT NOT NULL DEFAULT '',
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. 创建 checkins 表（打卡记录）
CREATE TABLE IF NOT EXISTS public.checkins (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0 AND duration_minutes <= 1440),
  checkin_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_checkins_date ON public.checkins (checkin_date DESC);
CREATE INDEX IF NOT EXISTS idx_checkins_user ON public.checkins (user_id, checkin_date DESC);

-- 3. 创建 friendships 表（好友关系）
CREATE TABLE IF NOT EXISTS public.friendships (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- ============================================
-- 4. 自动创建 profile（注册时触发）
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, nickname)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'nickname', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 5. 行级安全策略（RLS）
-- ============================================

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "任何人可以查看资料" ON public.profiles;
CREATE POLICY "任何人可以查看资料" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "用户只能修改自己的资料" ON public.profiles;
CREATE POLICY "用户只能修改自己的资料" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Checkins
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "查看自己与好友的打卡" ON public.checkins;
CREATE POLICY "查看自己与好友的打卡" ON public.checkins
  FOR SELECT USING (
    auth.uid() = user_id
    OR user_id IN (
      SELECT friend_id FROM public.friendships WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "只能创建自己的打卡" ON public.checkins;
CREATE POLICY "只能创建自己的打卡" ON public.checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "只能删除自己的打卡" ON public.checkins;
CREATE POLICY "只能删除自己的打卡" ON public.checkins
  FOR DELETE USING (auth.uid() = user_id);

-- Friendships
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "查看自己的好友关系" ON public.friendships;
CREATE POLICY "查看自己的好友关系" ON public.friendships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

DROP POLICY IF EXISTS "可以添加好友" ON public.friendships;
CREATE POLICY "可以添加好友" ON public.friendships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 6. 添加好友的辅助函数（双方自动互关）
-- ============================================
CREATE OR REPLACE FUNCTION public.add_friend(friend_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.friendships (user_id, friend_id) VALUES (auth.uid(), friend_id)
    ON CONFLICT (user_id, friend_id) DO NOTHING;
  INSERT INTO public.friendships (user_id, friend_id) VALUES (friend_id, auth.uid())
    ON CONFLICT (user_id, friend_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
