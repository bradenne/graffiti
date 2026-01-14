/**
 * Paint pixel art on the GitHub contribution graph with backdated empty commits.
 *
 * The graph is a grid of weeks (columns, starting on Sunday) by weekdays (rows,
 * Sunday = 0). Each lit pixel gets a random number of commits (between
 * MIN_COMMITS_PER_PIXEL and MAX_COMMITS_PER_PIXEL) so pixels spread across the
 * graph's green shades. The randomness is seeded by the date: same canvas,
 * same shades on every run.
 *
 * Usage (Node.js >= 23.6 runs TypeScript natively):
 *   node paint.ts preview   # print the canvas in the terminal
 *   node paint.ts paint     # create the commits in the current git repo
 */

import { execFileSync } from "node:child_process";

const MIN_COMMITS_PER_PIXEL = 1;
const MAX_COMMITS_PER_PIXEL = 12;
const ROWS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

type Bitmap = readonly string[];

// 7 rows each, '#' = lit pixel. Glyphs are 6 px wide.
const GLYPHS: Readonly<Record<string, Bitmap>> = {
  B: ["##### ", "##  ##", "##  ##", "##### ", "##  ##", "##  ##", "##### "],
  R: ["##### ", "##  ##", "##  ##", "##### ", "## ## ", "##  ##", "##  ##"],
  A: [" #### ", "##  ##", "##  ##", "######", "##  ##", "##  ##", "##  ##"],
};

// Arrow shaft and head, drawn right after the trigram on 2026.
const RIGHT_ARROW: Bitmap = [
  "   #   ",
  "   ##  ",
  "   ### ",
  "#######",
  "   ### ",
  "   ##  ",
  "   #   ",
];

const LEFT_ARROW: Bitmap = mirror(RIGHT_ARROW);

function mirror(bitmap: Bitmap): string[] {
  return bitmap.map((line) => [...line].reverse().join(""));
}

function textBitmap(text: string, letterSpacing = " "): string[] {
  return Array.from({ length: ROWS }, (_, row) =>
    [...text].map((letter) => GLYPHS[letter][row]).join(letterSpacing),
  );
}

function joinBitmaps(gap: string, ...bitmaps: Bitmap[]): string[] {
  return Array.from({ length: ROWS }, (_, row) => bitmaps.map((bitmap) => bitmap[row]).join(gap));
}

function utcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Deterministic pseudo-random integer in [min, max], derived from a string seed. */
function seededInt(seed: string, min: number, max: number): number {
  let hash = 2166136261;
  for (const char of seed) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  // Mulberry32 finalizer spreads the FNV-1a hash bits evenly.
  hash = Math.imul(hash ^ (hash >>> 15), hash | 1);
  hash ^= hash + Math.imul(hash ^ (hash >>> 7), hash | 61);
  const unit = ((hash ^ (hash >>> 14)) >>> 0) / 4294967296;
  return min + Math.floor(unit * (max - min + 1));
}

function commitsFor(day: Date): number {
  return seededInt(isoDay(day), MIN_COMMITS_PER_PIXEL, MAX_COMMITS_PER_PIXEL);
}

/** Terminal shade matching the GitHub quartile of a commit count. */
function shade(commits: number): string {
  const quartile = Math.ceil((commits / MAX_COMMITS_PER_PIXEL) * 4);
  return ["░", "▒", "▓", "█"][quartile - 1];
}

/** Sunday of the week holding January 1st: column 0 of the yearly graph. */
function firstSundayColumn(year: number): Date {
  const januaryFirst = utcDate(year, 1, 1);
  return addDays(januaryFirst, -januaryFirst.getUTCDay());
}

function columnCount(year: number): number {
  const days = (utcDate(year, 12, 31).getTime() - firstSundayColumn(year).getTime()) / DAY_MS;
  return Math.floor(days / 7) + 1;
}

function bitmapDates(year: number, bitmap: Bitmap, firstColumn: number): Date[] {
  const origin = firstSundayColumn(year);
  const dates: Date[] = [];
  bitmap.forEach((line, row) => {
    [...line].forEach((pixel, offset) => {
      if (pixel !== "#") return;
      const day = addDays(origin, (firstColumn + offset) * 7 + row);
      if (day.getUTCFullYear() !== year) {
        throw new Error(`Pixel (${row}, ${offset}) falls outside ${year}: ${isoDay(day)}`);
      }
      dates.push(day);
    });
  });
  return dates.sort((a, b) => a.getTime() - b.getTime());
}

function canvases(): Map<number, Date[]> {
  // <-- BRA -->, the right arrow tip lands on 2026-09-30.
  const framedTrigram = joinBitmaps("  ", LEFT_ARROW, textBitmap("BRA"), RIGHT_ARROW);
  return new Map([[2026, bitmapDates(2026, framedTrigram, 2)]]);
}

function preview(year: number, dates: Date[]): void {
  const lit = new Set(dates.map(isoDay));
  const origin = firstSundayColumn(year);
  const total = dates.reduce((sum, day) => sum + commitsFor(day), 0);
  console.log(`\n${year}  (${dates.length} pixels, ${total} commits)`);
  for (let row = 0; row < ROWS; row++) {
    let line = "";
    for (let column = 0; column < columnCount(year); column++) {
      const day = addDays(origin, column * 7 + row);
      line += lit.has(isoDay(day)) ? shade(commitsFor(day)) : day.getUTCFullYear() === year ? "·" : " ";
    }
    console.log(line);
  }
  console.log(`from ${isoDay(dates[0])} to ${isoDay(dates[dates.length - 1])}`);
}

function paint(dates: Date[]): void {
  for (const day of dates) {
    for (let index = 0; index < commitsFor(day); index++) {
      // Noon UTC keeps the same calendar day in nearly every timezone.
      const timestamp = `${isoDay(day)}T12:${String(index).padStart(2, "0")}:00+0000`;
      execFileSync(
        "git",
        ["commit", "--allow-empty", "--quiet", "-m", `chore(paint): pixel ${isoDay(day)} #${index + 1}`],
        { env: { ...process.env, GIT_AUTHOR_DATE: timestamp, GIT_COMMITTER_DATE: timestamp }, stdio: "inherit" },
      );
    }
  }
}

function main(): void {
  const command = process.argv[2] ?? "preview";
  if (command !== "preview" && command !== "paint") {
    console.error(`Unknown command: ${command}`);
    process.exit(1);
  }
  for (const [year, dates] of canvases()) {
    if (command === "preview") {
      preview(year, dates);
    } else {
      paint(dates);
      console.log(`${year}: ${dates.length} pixels painted`);
    }
  }
}

main();
