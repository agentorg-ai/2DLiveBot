// A part's path as points that can be moved: read once from its text, and written back as path
// text with the points on the face wherever the head's turn has taken them.
import type { Path } from "./part.ts";

/** One step of a path: its command, its points as x and y in turn, and whether they lie on the
 * face. */
export type Segment = { command: string; points: number[]; face: boolean };

/** How many numbers each command takes. */
const TAKES: Record<string, number> = { M: 2, L: 2, Q: 4, C: 6, Z: 0 };

/** The steps of a path. With `face`, all of it lies on the face. */
export function segmentsOf(path: Path, face = false): Segment[] {
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
