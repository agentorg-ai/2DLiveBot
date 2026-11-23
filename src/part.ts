// What a part is: a drawing for one slot of the figure, in layers that say how each moves.

/** The places on the figure a part can go, in the order an avatar's string lists them. An avatar
 * has at most one part in each. A new slot joins at the end, so the strings there are stay as
 * they are written. */
export const SLOTS = ["face", "eyes"] as const;
export type Slot = (typeof SLOTS)[number];

/** What a shape is painted with: one of its part's colours by position (`"0"`, `"1"`), or a
 * fixed colour (`#rrggbb`). */
export type Paint = `${number}` | `#${string}`;

/** One flat shape: a path in the 100 by 100 drawing space, filled with one paint. */
export type Shape = { d: string; fill: Paint };

/** A point in the drawing space. */
export type Point = readonly [number, number];

/** Paint order across every layer of an avatar, low first. */
export const Z = { head: 40, features: 50 } as const;

/** Shapes that move as one. Every layer rides the head as it shifts, tilts and breathes. `at` is
 * a layer's place on the face: as the head turns, a layer with a place travels round the head
 * as a mark on a ball does, toward the side the head turns to and narrowing as it nears the
 * edge. */
export type Layer = { z: number; shapes: readonly Shape[] } & (
  | {
      /** The head carries it. With no place of its own it is the head's outline. */
      on: "head";
      at?: Point;
    }
  | {
      /** An eye: it also looks about by itself, and closes onto its place in a blink. */
      on: "eyes";
      at: Point;
    }
);

export type Part = {
  /** Its name in an avatar's string, for good: a lowercase letter, then lowercase letters and
   * digits. A drawing that changes what an avatar looks like is a new part with a new id. */
  id: string;
  slot: Slot;
  /** The colours it takes, each with its default as six hex digits. */
  colors: readonly string[];
  layers: readonly Layer[];
};
