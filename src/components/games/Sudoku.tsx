import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Check } from "lucide-react";
import { toast } from "sonner";

// Simple deterministic-ish daily Sudoku generator (seeded by date).
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function makeBase(): number[][] {
  const base = 3;
  const side = 9;
  const r = (a: number, b: number, c: number) => [a, b, c];
  const rows = r(0, 1, 2).flatMap((g) => r(0, 1, 2).map((n) => g * 3 + n));
  const cols = rows;
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return Array.from({ length: side }, (_, i) =>
    Array.from({ length: side }, (_, j) => nums[(base * (rows[i] % base) + Math.floor(rows[i] / base) + cols[j]) % side]),
  );
}

function shuffleSolution(seed: number): number[][] {
  const grid = makeBase();
  const rand = rng(seed);
  // shuffle digits 1-9
  const map = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = 9; i > 1; i--) {
    const j = Math.floor(rand() * i) + 1;
    [map[i], map[j]] = [map[j], map[i]];
  }
  return grid.map((row) => row.map((v) => map[v]));
}

function makePuzzle(seed: number, holes = 45) {
  const solution = shuffleSolution(seed);
  const puzzle = solution.map((r) => [...r]);
  const rand = rng(seed + 1);
  let removed = 0;
  while (removed < holes) {
    const r = Math.floor(rand() * 9);
    const c = Math.floor(rand() * 9);
    if (puzzle[r][c] !== 0) {
      puzzle[r][c] = 0;
      removed++;
    }
  }
  return { puzzle, solution };
}

export const Sudoku = () => {
  const seed = useMemo(() => {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }, []);
  const { puzzle, solution } = useMemo(() => makePuzzle(seed), [seed]);
  const [grid, setGrid] = useState<number[][]>(puzzle.map((r) => [...r]));
  const [selected, setSelected] = useState<[number, number] | null>(null);

  useEffect(() => setGrid(puzzle.map((r) => [...r])), [puzzle]);

  const setCell = (r: number, c: number, v: number) => {
    if (puzzle[r][c] !== 0) return;
    const next = grid.map((row) => [...row]);
    next[r][c] = v;
    setGrid(next);
  };

  const check = () => {
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (grid[r][c] !== solution[r][c]) {
          toast.error("Not quite — keep going!");
          return;
        }
    toast.success("🎉 Solved! Daily Sudoku complete.");
  };

  const reset = () => setGrid(puzzle.map((r) => [...r]));

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-9 border-2 border-foreground bg-card">
        {grid.map((row, r) =>
          row.map((v, c) => {
            const fixed = puzzle[r][c] !== 0;
            const isSel = selected && selected[0] === r && selected[1] === c;
            const wrong = v !== 0 && v !== solution[r][c];
            return (
              <button
                key={`${r}-${c}`}
                onClick={() => setSelected([r, c])}
                className={`w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center text-base sm:text-lg font-serif font-bold border border-border
                  ${(c + 1) % 3 === 0 && c !== 8 ? "border-r-2 border-r-foreground" : ""}
                  ${(r + 1) % 3 === 0 && r !== 8 ? "border-b-2 border-b-foreground" : ""}
                  ${fixed ? "text-foreground bg-secondary" : wrong ? "text-destructive" : "text-primary"}
                  ${isSel ? "ring-2 ring-primary ring-inset" : ""}
                `}
              >
                {v || ""}
              </button>
            );
          }),
        )}
      </div>
      <div className="grid grid-cols-9 gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <Button
            key={n}
            size="sm"
            variant="outline"
            onClick={() => selected && setCell(selected[0], selected[1], n)}
            className="w-9 h-9 sm:w-11 sm:h-11 p-0 font-serif text-lg"
          >
            {n}
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => selected && setCell(selected[0], selected[1], 0)} variant="ghost" size="sm">
          Erase
        </Button>
        <Button onClick={reset} variant="outline" size="sm"><RotateCcw className="w-4 h-4 mr-1.5" /> Reset</Button>
        <Button onClick={check} size="sm"><Check className="w-4 h-4 mr-1.5" /> Check</Button>
      </div>
    </div>
  );
};
