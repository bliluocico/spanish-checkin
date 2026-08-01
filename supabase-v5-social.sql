-- v5 社交功能：打卡反应 + 提醒
CREATE TABLE IF NOT EXISTS public.checkin_reactions (
  checkin_id UUID REFERENCES public.checkins(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT DEFAULT '❤️',
  PRIMARY KEY (checkin_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.reminders (
  from_user UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (from_user, to_user)
);

ALTER TABLE public.checkin_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reactions_select" ON public.checkin_reactions FOR SELECT USING (true);
CREATE POLICY "reactions_insert" ON public.checkin_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reactions_delete" ON public.checkin_reactions FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reminders_all" ON public.reminders FOR ALL USING (true);
