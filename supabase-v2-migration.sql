-- ============================================
-- 西语学习打卡平台 v2 数据库升级
-- 在 Supabase SQL Editor 中执行本文件
-- ============================================

-- 1. checkins 表新增字段
ALTER TABLE public.checkins ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.checkins ADD COLUMN IF NOT EXISTS challenge_id UUID;

-- 2. 创建 challenges 表（打卡挑战）
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  total_days INTEGER NOT NULL CHECK (total_days > 0),
  deadline_time TIME NOT NULL DEFAULT '23:59',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  winner_id UUID REFERENCES auth.users(id),
  failed_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_challenges_status ON public.challenges (status);

-- 3. 创建 challenge_participants 表（参与关系）
CREATE TABLE IF NOT EXISTS public.challenge_participants (
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'failed', 'completed')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (challenge_id, user_id)
);

-- 4. checkins 外键关联 challenges
-- 先清理可能存在的不合法数据
DELETE FROM public.checkins WHERE challenge_id IS NOT NULL AND challenge_id NOT IN (SELECT id FROM public.challenges);
-- 添加外键
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'checkins_challenge_id_fkey'
  ) THEN
    ALTER TABLE public.checkins ADD CONSTRAINT checkins_challenge_id_fkey
      FOREIGN KEY (challenge_id) REFERENCES public.challenges(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 5. 创建 Storage bucket（图片存储）
-- 注意：这需要在 Supabase 后台 Storage 页面手动创建 bucket，命名为 checkin-images

-- 6. challenges RLS 安全策略
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "参与者可查看挑战" ON public.challenges;
CREATE POLICY "参与者可查看挑战" ON public.challenges
  FOR SELECT USING (
    creator_id = auth.uid()
    OR id IN (
      SELECT challenge_id FROM public.challenge_participants WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "认证用户可创建挑战" ON public.challenges;
CREATE POLICY "认证用户可创建挑战" ON public.challenges
  FOR INSERT WITH CHECK (creator_id = auth.uid());

DROP POLICY IF EXISTS "发起人可更新挑战" ON public.challenges;
CREATE POLICY "发起人可更新挑战" ON public.challenges
  FOR UPDATE USING (creator_id = auth.uid());

-- 7. challenge_participants RLS
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "参与者可查看" ON public.challenge_participants;
CREATE POLICY "参与者可查看" ON public.challenge_participants
  FOR SELECT USING (
    user_id = auth.uid()
    OR challenge_id IN (
      SELECT id FROM public.challenges WHERE creator_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "认证用户可加入挑战" ON public.challenge_participants;
CREATE POLICY "认证用户可加入挑战" ON public.challenge_participants
  FOR INSERT WITH CHECK (true);

-- 8. profiles 新增 badges 字段
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb;
