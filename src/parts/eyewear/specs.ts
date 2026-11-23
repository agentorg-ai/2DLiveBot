import { face, type Part, type Shape, Z } from "../../part.ts";

/** How far a rim reaches from its eye's middle, across and down. It is a little wider than it
 * is tall. */
const REACH = [10.8, 9.8] as const;
/** How square a rim's corners are: squarer above, so its top is flatter, and rounder below. */
const CORNER = { top: 0.74, bottom: 0.6 } as const;

const n = (value: number) => Math.round(value * 100) / 100;

/** A rim about a point: a soft shape between a circle and a rounded square. */
const rim = (x: number, y: number) => {
  const [rx, ry] = REACH;
  const [tx, ty] = [n(rx * CORNER.top), n(ry * CORNER.top)];
  const [bx, by] = [n(rx * CORNER.bottom), n(ry * CORNER.bottom)];
  return `M${n(x - rx)} ${y}C${n(x - rx)} ${n(y - ty)} ${n(x - tx)} ${n(y - ry)} ${x} ${n(y - ry)}C${n(x + tx)} ${n(y - ry)} ${n(x + rx)} ${n(y - ty)} ${n(x + rx)} ${y}C${n(x + rx)} ${n(y + by)} ${n(x + bx)} ${n(y + ry)} ${x} ${n(y + ry)}C${n(x - bx)} ${n(y + ry)} ${n(x - rx)} ${n(y + by)} ${n(x - rx)} ${y}Z`;
};

/** A line of the frame, on the face. */
const wire = (d: string): Shape => ({ d: [face(d)], stroke: "0", width: 2 });

/** Wire glasses: a rim about each eye, a bridge between them, and an arm from each rim out to
 * the side of the head. All of them lie on the face, so in a turn each rim goes with its eye,
 * the one ahead narrowing, and the arm on the side turned toward us lengthens. */
export const specs: Part = {
  id: "specs",
  slot: "eyewear",
  colors: ["2a2530"],
  layers: [
    {
      z: Z.eyewear,
      shapes: [
        wire(rim(33.5, 60)),
        wire(rim(66.5, 60)),
        wire("M44.2 57.6C46.6 55.4 53.4 55.4 55.8 57.6"),
        wire("M22.8 57.6L13 55.2"),
        wire("M77.2 57.6L87 55.2"),
      ],
    },
  ],
};
