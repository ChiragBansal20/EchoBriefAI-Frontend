import { useEffect, useState } from "react";
import { games } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { Trophy, Flame, Medal } from "lucide-react";

interface Row {
  user_id: string;
  name: string;
  avatar_url: string | null;
  total_score: number;
  games_played: number;
  streak: number;
}

export const Leaderboard = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [myStreak, setMyStreak] = useState<number>(0);
  const { user } = useAuth();
  const { t } = useI18n();

  const load = async () => {
    setLoading(true);
    try {
      const data = await games.leaderboard();
      setRows(data.leaderboard || []);
    } catch { /* ignore */ }
    if (user) {
      try {
        const s = await games.streak();
        setMyStreak(s.streak ?? 0);
      } catch { /* ignore */ }
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  // Refresh when a game is recorded
  useEffect(() => {
    const handler = () => load();
    window.addEventListener("game-recorded", handler);
    return () => window.removeEventListener("game-recorded", handler);
  }, [user?.id]);

  return (
    <div className="bg-card border border-border rounded-lg p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif font-bold text-xl flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent" /> {t("leaderboard")}
        </h3>
        {user && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent font-semibold text-sm">
            <Flame className="w-4 h-4" /> {myStreak} {t("streak")}
          </div>
        )}
      </div>
      {!user && <p className="text-xs text-muted-foreground mb-3">{t("signin_to_track")}</p>}
      {loading ? (
        <div className="text-sm text-muted-foreground text-center py-6">…</div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No scores yet. Be the first!</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r, i) => (
            <li key={r.user_id} className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 transition-colors">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                i === 0 ? "bg-yellow-500 text-white" :
                i === 1 ? "bg-gray-400 text-white" :
                i === 2 ? "bg-orange-600 text-white" :
                "bg-muted text-muted-foreground"
              }`}>
                {i < 3 ? <Medal className="w-3.5 h-3.5" /> : i + 1}
              </span>
              <span className="flex-1 truncate font-medium text-sm">{r.name}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Flame className="w-3 h-3 text-accent" /> {r.streak}
              </span>
              <span className="font-bold text-sm text-primary">{r.total_score}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
