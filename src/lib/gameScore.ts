/**
 * gameScore.ts – replaces Supabase-based recording with Express API call.
 */
import { games, getAccessToken } from "@/lib/api";
import { toast } from "sonner";

export const recordGamePlay = async (game: string, score: number, durationSeconds?: number): Promise<boolean> => {
  if (!getAccessToken()) {
    toast.info("Sign in to track your streak & climb the leaderboard");
    return false;
  }
  try {
    const data = await games.recordScore(game, score, durationSeconds);
    toast.success(data.message || `+${score} points!`);
    return true;
  } catch (err: any) {
    console.error(err);
    toast.error("Could not record score");
    return false;
  }
};
