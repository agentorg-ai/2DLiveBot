// What a part is: a drawing for one slot of the figure, in layers of flat shapes that say which
// of their outline lies on the face.

/** The places on the figure a part can go, in the order an avatar's string lists them. An avatar
 * has at most one part in each. A new slot joins at the end, so the strings there are stay as
 * they are written. */
export const SLOTS = ["face", "eyes", "hair", "eyewear", "headwear"] as const;
export type Slot = (typeof SLOTS)[number];

/** What a shape is painted with: one of its part's colours by position (`"0"`, `"1"`), as it is
 * or shaded (`"0-"`), or a fixed colour (`#rrggbb`). */
export type Paint = `${number}${"" | "-"}` | `#${string}`;

/** A point in the drawing space. */
export type Point = readonly [number, number];

/** A stretch of a path that lies on the face. */
export type OnFace = { face: string };
export const face = (d: string): OnFace => ({ face: d });

/** A path in the 100 by 100 drawing space, whole or in stretches. Each stretch is path text
 * that carries on from the one before, in M, L, C, Q and Z with absolute points.
 *
 * A plain stretch stays with the head's outline. A stretch in `face()` lies on the face: as the
 * head turns, each of its points travels round the head as a mark on a ball does. So hair is
 * one shape whose rim is plain and whose hairline is on the face: in a turn the rim stays, the
 * hairline goes with the face, and the hair between them widens on the side turned toward us
 * and thins on the other. */
export type Path = string | readonly (string | OnFace)[];

/** One flat shape: a path that is filled, drawn as a line of a width, or both. */
export type Shape = { d: Path; fill?: Paint; stroke?: Paint; width?: number };

/** Paint order across every layer of an avatar, low first. */
export const Z = {
  behind: 10,
  head: 40,
  features: 50,
  eyewear: 55,
  hair: 60,
  headwear: 70,
} as const;

/** Shapes painted together. Every layer rides the head as it shifts, tilts and breathes. */
export type Layer = {
  z: number;
  shapes: readonly Shape[];
  /** The layer is an eye, about this point: all of it lies on the face, it looks about by
   * itself, and it closes onto the point in a blink. */
  eye?: Point;
};

export type Part = {
  /** Its name in an avatar's string, for good: a lowercase letter, then lowercase letters and
   * digits. A drawing that changes what an avatar looks like is a new part with a new id. */
  id: string;
  slot: Slot;
  /** The colours it takes, each with its default as six hex digits. */
  colors: readonly string[];
  layers: readonly Layer[];
};
