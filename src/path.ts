// A part's path as points that can be moved: read once from its text, and written back as path
// text with the points on the face wherever the head's turn has taken them.
import type { Path } from "./part.ts";

/** One step of a path: its command, its points as x and y in turn, and whether they lie on the
 * face. */
export type Segment = { command: string; points: number[]; face: boolean };

/** How many numbers each command takes. */
const TAKES: Record<string, number> = { M: 2, L: 2, Q: 4, C: 6, Z: 0 };

/** The longest a step on the face may be, in drawing units. A longer one is cut into equal
 * pieces, so that a line keeps a smooth curve when a turn moves each of its points. */
const PIECE = 10;

type Spot = readonly [number, number];
const between = (a: Spot, b: Spot, t: number): Spot => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
];

/** A line or curve, as the points that shape it, cut at `t` of the way into two of the same
 * kind. */
function cut(hull: readonly Spot[], t: number): [Spot[], Spot[]] {
  const [first, rest]: [Spot[], Spot[]] = [[hull[0] as Spot], [hull.at(-1) as Spot]];
  let level = hull;
  while (level.length > 1) {
    level = level.slice(1).map((spot, i) => between(level[i] as Spot, spot, t));
    first.push(level[0] as Spot);
    rest.unshift(level.at(-1) as Spot);
  }
  return [first, rest];
}

/** The steps with each long one on the face cut into pieces. */
function inPieces(segments: Segment[]): Segment[] {
  let [pen, start]: [Spot, Spot] = [
    [0, 0],
    [0, 0],
  ];
  return segments.flatMap((segment) => {
    const spots: Spot[] = [];
    for (let i = 0; i < segment.points.length; i += 2)
      spots.push([segment.points[i] as number, segment.points[i + 1] as number]);
    const from = pen;
    pen = segment.command === "Z" ? start : (spots.at(-1) ?? pen);
    if (segment.command === "M") start = pen;
    if (!segment.face || segment.command === "M" || segment.command === "Z") return [segment];
    let hull = [from, ...spots];
    const length = hull.slice(1).reduce((sum, spot, i) => {
      const before = hull[i] as Spot;
      return sum + Math.hypot(spot[0] - before[0], spot[1] - before[1]);
    }, 0);
    const pieces: Segment[] = [];
    for (let left = Math.ceil(length / PIECE); left > 0; left--) {
      const [piece, rest] = left > 1 ? cut(hull, 1 / left) : [hull, hull];
      pieces.push({ ...segment, points: piece.slice(1).flat() });
      hull = rest;
    }
    return pieces;
  });
}

/** The steps of a path. With `face`, all of it lies on the face. */
export function segmentsOf(path: Path, face = false): Segment[] {
  return inPieces(stepsOf(path, face));
}

function stepsOf(path: Path, face: boolean): Segment[] {
  const stretches = typeof path === "string" ? [path] : path;
  return stretches.flatMap((stretch) => {
    const text = typeof stretch === "string" ? stretch : stretch.face;
    const on = face || typeof stretch !== "string";
    return [...text.matchAll(/([A-Za-z])([^A-Za-z]*)/g)].flatMap(([, command = "", rest = ""]) => {
      const takes = TAKES[command];
      if (takes === undefined) throw new Error(`A path uses ${command}, which is not read here`);
      const numbers = (rest.match(/-?\d*\.?\d+/g) ?? []).map(Number);
      if (takes === 0) return [{ command, points: [], face: on }];
      if (numbers.length === 0 || numbers.length % takes)
        throw new Error(`A path's ${command} has ${numbers.length} numbers`);
      // A command with several sets of points is that command again for each.
      return Array.from({ length: numbers.length / takes }, (_, i) => ({
        command,
        points: numbers.slice(i * takes, (i + 1) * takes),
        face: on,
      }));
    });
  });
}

const n = (value: number) => Math.round(value * 100) / 100;

/** The path's text. With `move`, each point on the face is where `move` puts it. */
export function pathText(
  segments: readonly Segment[],
  move?: (x: number, y: number) => readonly [number, number],
): string {
  let text = "";
  for (const { command, points, face } of segments) {
    text += command;
    for (let i = 0; i < points.length; i += 2) {
      const [x, y] = [points[i] as number, points[i + 1] as number];
      const [tx, ty] = move && face ? move(x, y) : [x, y];
      text += `${i ? " " : ""}${n(tx)} ${n(ty)}`;
    }
  }
  return text;
}
