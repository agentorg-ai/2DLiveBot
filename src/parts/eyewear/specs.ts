import { face, type Part, type Shape, Z } from "../../part.ts";

/** A round rim about a point. */
const rim = (x: number, y: number, r: number) => {
  const k = Math.round(r * 55.23) / 100;
  return `M${x - r} ${y}C${x - r} ${y - k} ${x - k} ${y - r} ${x} ${y - r}C${x + k} ${y - r} ${x + r} ${y - k} ${x + r} ${y}C${x + r} ${y + k} ${x + k} ${y + r} ${x} ${y + r}C${x - k} ${y + r} ${x - r} ${y + k} ${x - r} ${y}Z`;
};

/** A line of the frame, on the face. */
const wire = (d: string): Shape => ({ d: [face(d)], stroke: "0", width: 2 });

/** Round wire glasses: a rim about each eye, a bridge between them, and an arm from each rim
 * out to the side of the head. All of them lie on the face, so in a turn each rim goes with its
 * eye, the one ahead narrowing, and the arm on the side turned toward us lengthens. */
export const specs: Part = {
  id: "specs",
  slot: "eyewear",
  colors: ["2a2530"],
  layers: [
    {
      z: Z.eyewear,
      shapes: [
        wire(rim(33.5, 60, 8.8)),
        wire(rim(66.5, 60, 8.8)),
        wire("M42.1 58.2C45 55.6 55 55.6 57.9 58.2"),
        wire("M24.9 58.2L13 55.5"),
        wire("M75.1 58.2L87 55.5"),
      ],
    },
  ],
};
