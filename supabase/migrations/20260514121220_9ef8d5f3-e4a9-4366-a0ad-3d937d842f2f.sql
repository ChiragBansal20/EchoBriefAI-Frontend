CREATE OR REPLACE FUNCTION public.get_user_streak(_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
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