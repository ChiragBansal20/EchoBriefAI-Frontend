import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface Clue {
  num: number;
  row: number;
  col: number;
  dir: "across" | "down";
  answer: string;
  clue: string;
}

// A small fixed daily mini-crossword (5x5 inspired). Easier to ship than a full generator.
const PUZZLES: { size: number; cells: (string | null)[][]; clues: Clue[] }[] = [
  {
    size: 5,
    cells: [
      ["N", "E", "W", "S", null],
      ["E", null, "I", null, "A"],
      ["W", "O", "R", "L", "D"],
      [null, "P", "E", null, "D"],
      ["A", "I", null, "U", "S"],
    ],
    clues: [
      { num: 1, row: 0, col: 0, dir: "across", answer: "NEWS", clue: "Daily updates" },
      { num: 5, row: 2, col: 0, dir: "across", answer: "WORLD", clue: "The whole globe" },
      { num: 1, row: 0, col: 0, dir: "down", answer: "NEW", clue: "Brand-___" },
      { num: 2, row: 0, col: 2, dir: "down", answer: "WIRE", clue: "News service medium" },
      { num: 3, row: 1, col: 4, dir: "down", answer: "ADDS", clue: "Includes more" },
      { num: 4, row: 4, col: 0, dir: "across", answer: "AI", clue: "Artificial intelligence (abbr.)" },
    ],
  },
];

export const Crossword = () => {
  const puzzle = useMemo(() => {
    const idx = new Date().getDate() % PUZZLES.length;
    return PUZZLES[idx];
  }, []);

  const [grid, setGrid] = useState<string[][]>(
    puzzle.cells.map((row) => row.map((c) => (c === null ? "" : ""))),
  );

  const setCell = (r: number, c: number, v: string) => {
    const next = grid.map((row) => [...row]);
    next[r][c] = v.toUpperCase().slice(0, 1);
    setGrid(next);
  };

  const check = () => {
    for (let r = 0; r < puzzle.size; r++)
      for (let c = 0; c < puzzle.size; c++) {
        const exp = puzzle.cells[r][c];
        if (exp === null) continue;
        if (grid[r][c] !== exp) { toast.error("Some answers aren't right yet."); return; }
      }
    toast.success("🎉 Crossword solved!");
  };

  const reset = () => setGrid(puzzle.cells.map((row) => row.map(() => "")));

  // number map
  const numbers: Record<string, number> = {};
  puzzle.clues.forEach((cl) => { numbers[`${cl.row}-${cl.col}`] = cl.num; });

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <div
        className="grid bg-card border-2 border-foreground"
        style={{ gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))` }}
      >
        {puzzle.cells.map((row, r) =>
          row.map((cell, c) => {
            if (cell === null) {
              return <div key={`${r}-${c}`} className="w-12 h-12 bg-foreground" />;
            }
            const num = numbers[`${r}-${c}`];
            return (
              <div key={`${r}-${c}`} className="relative w-12 h-12 border border-border">
                {num && <span className="absolute top-0 left-0.5 text-[9px] font-bold">{num}</span>}
                <input
                  value={grid[r][c]}
                  onChange={(e) => setCell(r, c, e.target.value)}
                  maxLength={1}
                  className="w-full h-full text-center font-serif text-lg font-bold uppercase bg-transparent focus:bg-secondary focus:outline-none"
                />
              </div>
            );
          }),
        )}
      </div>
      <div className="space-y-4 max-w-md">
        <div>
          <h3 className="font-serif font-bold text-lg mb-2">Across</h3>
          <ul className="space-y-1 text-sm">
            {puzzle.clues.filter((cl) => cl.dir === "across").map((cl) => (
              <li key={`a-${cl.num}`}><span className="font-bold">{cl.num}.</span> {cl.clue}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-serif font-bold text-lg mb-2">Down</h3>
          <ul className="space-y-1 text-sm">
            {puzzle.clues.filter((cl) => cl.dir === "down").map((cl) => (
              <li key={`d-${cl.num}`}><span className="font-bold">{cl.num}.</span> {cl.clue}</li>
            ))}
          </ul>
        </div>
        <div className="flex gap-2">
          <Button onClick={reset} variant="outline" size="sm"><RotateCcw className="w-4 h-4 mr-1.5" /> Reset</Button>
          <Button onClick={check} size="sm"><Check className="w-4 h-4 mr-1.5" /> Check</Button>
        </div>
      </div>
    </div>
  );
};
