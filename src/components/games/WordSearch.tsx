import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

const WORD_BANKS = [
  ["NEWS", "MEDIA", "PRESS", "STORY", "PRINT", "EDIT", "PAPER", "REPORT"],
  ["WORLD", "OCEAN", "RIVER", "MOUNT", "FOREST", "DESERT", "VALLEY", "ISLAND"],
  ["LOGIC", "PUZZLE", "BRAIN", "THINK", "SOLVE", "GUESS", "RIDDLE", "SMART"],
];

const SIZE = 12;

function dailySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generate(words: string[], seed: number) {
  const rand = rng(seed);
  const grid: string[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(""));
  const placements: { word: string; cells: [number, number][] }[] = [];
  const dirs: [number, number][] = [
    [0, 1], [1, 0], [1, 1], [-1, 1],
  ];

  for (const w of words) {
    let placed = false;
    for (let attempt = 0; attempt < 200 && !placed; attempt++) {
      const [dr, dc] = dirs[Math.floor(rand() * dirs.length)];
      const r0 = Math.floor(rand() * SIZE);
      const c0 = Math.floor(rand() * SIZE);
      const r1 = r0 + dr * (w.length - 1);
      const c1 = c0 + dc * (w.length - 1);
      if (r1 < 0 || r1 >= SIZE || c1 < 0 || c1 >= SIZE) continue;
      let ok = true;
      const cells: [number, number][] = [];
      for (let i = 0; i < w.length; i++) {
        const r = r0 + dr * i;
        const c = c0 + dc * i;
        if (grid[r][c] && grid[r][c] !== w[i]) { ok = false; break; }
        cells.push([r, c]);
      }
      if (!ok) continue;
      cells.forEach(([r, c], i) => (grid[r][c] = w[i]));
      placements.push({ word: w, cells });
      placed = true;
    }
  }

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (!grid[r][c]) grid[r][c] = letters[Math.floor(rand() * 26)];

  return { grid, placements };
}

export const WordSearch = () => {
  const seed = useMemo(() => dailySeed(), []);
  const words = useMemo(() => WORD_BANKS[seed % WORD_BANKS.length], [seed]);
  const { grid, placements } = useMemo(() => generate(words, seed), [words, seed]);

  const [start, setStart] = useState<[number, number] | null>(null);
  const [end, setEnd] = useState<[number, number] | null>(null);
  const [found, setFound] = useState<Set<string>>(new Set());

  const path = useMemo(() => {
    if (!start || !end) return [] as [number, number][];
    const [r0, c0] = start;
    const [r1, c1] = end;
    const dr = Math.sign(r1 - r0);
    const dc = Math.sign(c1 - c0);
    const len = Math.max(Math.abs(r1 - r0), Math.abs(c1 - c0)) + 1;
    if ((Math.abs(r1 - r0) === Math.abs(c1 - c0)) || r0 === r1 || c0 === c1) {
      return Array.from({ length: len }, (_, i) => [r0 + dr * i, c0 + dc * i] as [number, number]);
    }
    return [];
  }, [start, end]);

  const inPath = (r: number, c: number) => path.some(([rr, cc]) => rr === r && cc === c);
  const inFoundCell = (r: number, c: number) =>
    placements.some((p) => found.has(p.word) && p.cells.some(([rr, cc]) => rr === r && cc === c));

  const tryCommit = (s: [number, number], e: [number, number]) => {
    const word = path.map(([r, c]) => grid[r][c]).join("");
    const reversed = word.split("").reverse().join("");
    const match = words.find((w) => w === word || w === reversed);
    if (match && !found.has(match)) {
      const next = new Set(found);
      next.add(match);
      setFound(next);
      toast.success(`Found: ${match}`);
      if (next.size === words.length) toast.success("🎉 All words found!");
    }
    setStart(null);
    setEnd(null);
  };

  const reset = () => { setFound(new Set()); setStart(null); setEnd(null); };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      <div
        className="grid bg-card border-2 border-foreground select-none"
        style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
        onMouseLeave={() => { if (start && !end) setStart(null); }}
      >
        {grid.map((row, r) =>
          row.map((ch, c) => {
            const sel = inPath(r, c);
            const isFound = inFoundCell(r, c);
            return (
              <button
                key={`${r}-${c}`}
                onMouseDown={() => { setStart([r, c]); setEnd([r, c]); }}
                onMouseEnter={() => { if (start) setEnd([r, c]); }}
                onMouseUp={() => start && end && tryCommit(start, end)}
                onTouchStart={() => { setStart([r, c]); setEnd([r, c]); }}
                className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-serif font-bold border border-border transition-colors
                  ${isFound ? "bg-primary/20 text-primary" : sel ? "bg-accent/30" : "bg-card hover:bg-secondary"}
                `}
              >
                {ch}
              </button>
            );
          }),
        )}
      </div>
      <div className="flex flex-col gap-3 min-w-[180px]">
        <h3 className="font-serif font-bold text-lg">Find these words</h3>
        <ul className="space-y-1">
          {words.map((w) => (
            <li
              key={w}
              className={`text-sm font-mono ${found.has(w) ? "line-through text-muted-foreground" : "text-foreground"}`}
            >
              {w}
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">Click and drag across letters horizontally, vertically, or diagonally.</p>
        <Button onClick={reset} variant="outline" size="sm" className="w-fit">
          <RotateCcw className="w-4 h-4 mr-1.5" /> Reset
        </Button>
      </div>
    </div>
  );
};
