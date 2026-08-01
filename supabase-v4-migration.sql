-- v4 挑战系统升级
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'time';
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS goal_value INTEGER DEFAULT 0;
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS pending BOOLEAN DEFAULT true;
ALTER TABLE public.challenge_participants ADD COLUMN IF NOT EXISTS accepted BOOLEAN DEFAULT false;
