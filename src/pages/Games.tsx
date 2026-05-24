import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Sudoku } from "@/components/games/Sudoku";
import { WordSearch } from "@/components/games/WordSearch";
import { Crossword } from "@/components/games/Crossword";
import { Leaderboard } from "@/components/games/Leaderboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid3x3, Search, LayoutGrid, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { recordGamePlay } from "@/lib/gameScore";
import { Button } from "@/components/ui/button";

const Games = () => {
  const { t } = useI18n();
  const [recording, setRecording] = useState<string | null>(null);

  const log = async (game: string, score: number) => {
    setRecording(game);
    await recordGamePlay(game, score);
    setRecording(null);
    // notify leaderboard refresh by reloading
    window.dispatchEvent(new CustomEvent("game-recorded"));
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container relative py-12 text-center animate-fade-in">
          <span className="byline text-accent">{t("games_hero_eyebrow")}</span>
          <h1 className="headline text-4xl md:text-5xl mt-2">{t("games_hero_title")}</h1>
          <p className="mt-3 text-base text-foreground/70 max-w-xl mx-auto">{t("games_hero_sub")}</p>
        </div>
      </section>

      <main className="container py-8 grid lg:grid-cols-[1fr_320px] gap-8">
        <Tabs defaultValue="sudoku" className="w-full">
          <TabsList className="mx-auto grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="sudoku"><Grid3x3 className="w-4 h-4 mr-1.5" /> {t("sudoku")}</TabsTrigger>
            <TabsTrigger value="wordsearch"><Search className="w-4 h-4 mr-1.5" /> {t("word_search")}</TabsTrigger>
            <TabsTrigger value="crossword"><LayoutGrid className="w-4 h-4 mr-1.5" /> {t("crossword")}</TabsTrigger>
          </TabsList>

          <TabsContent value="sudoku" className="mt-8">
            <div className="flex flex-col items-center gap-4">
              <Sudoku />
              <Button onClick={() => log("sudoku", 50)} disabled={recording === "sudoku"} className="hover-scale">
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark Sudoku as played (+50)
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="wordsearch" className="mt-8">
            <div className="flex flex-col items-center gap-4">
              <WordSearch />
              <Button onClick={() => log("wordsearch", 30)} disabled={recording === "wordsearch"} className="hover-scale">
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark Word Search as played (+30)
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="crossword" className="mt-8">
            <div className="flex flex-col items-center gap-4">
              <Crossword />
              <Button onClick={() => log("crossword", 40)} disabled={recording === "crossword"} className="hover-scale">
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark Crossword as played (+40)
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <aside className="lg:sticky lg:top-32 lg:self-start">
          <Leaderboard />
        </aside>
      </main>
    </div>
  );
};

export default Games;
