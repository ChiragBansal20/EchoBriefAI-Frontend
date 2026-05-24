ALTER VIEW public.leaderboard SET (security_invoker = on);

REVOKE EXECUTE ON FUNCTION public.get_user_streak(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_streak(UUID) TO authenticated;