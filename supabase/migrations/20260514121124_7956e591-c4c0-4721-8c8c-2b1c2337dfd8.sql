CREATE TABLE public.game_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  game TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER,
  played_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  played_date DATE NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date
);

ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Game scores viewable by all authenticated"
  ON public.game_scores FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own game scores"
  ON public.game_scores FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_game_scores_user_date ON public.game_scores(user_id, played_date);
CREATE INDEX idx_game_scores_score ON public.game_scores(score DESC);

CREATE OR REPLACE FUNCTION public.get_user_streak(_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  streak INTEGER := 0;
  check_date DATE := (now() AT TIME ZONE 'UTC')::date;
  has_play BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS(SELECT 1 FROM public.game_scores WHERE user_id = _user_id AND played_date = check_date) INTO has_play;
    IF has_play THEN
      streak := streak + 1;
      check_date := check_date - INTERVAL '1 day';
    ELSE
      IF streak = 0 AND check_date = (now() AT TIME ZONE 'UTC')::date THEN
        check_date := check_date - INTERVAL '1 day';
        SELECT EXISTS(SELECT 1 FROM public.game_scores WHERE user_id = _user_id AND played_date = check_date) INTO has_play;
        IF NOT has_play THEN RETURN 0; END IF;
      ELSE
        EXIT;
      END IF;
    END IF;
  END LOOP;
  RETURN streak;
END;
$$;

CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  gs.user_id,
  COALESCE(p.full_name, 'Player') AS name,
  p.avatar_url,
  SUM(gs.score)::INT AS total_score,
  COUNT(*)::INT AS games_played,
  public.get_user_streak(gs.user_id) AS streak
FROM public.game_scores gs
LEFT JOIN public.profiles p ON p.user_id = gs.user_id
GROUP BY gs.user_id, p.full_name, p.avatar_url
ORDER BY total_score DESC
LIMIT 50;

GRANT SELECT ON public.leaderboard TO authenticated, anon;