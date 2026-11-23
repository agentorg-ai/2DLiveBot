import { face, type Part, Z } from "../../part.ts";

/** A round rim about an eye. */
const rim = (x: number, y: number, r: number) => {
  const k = r * 0.5523;
  return `M${x - r} ${y}C${x - r} ${y - k} ${x - k} ${y - r} ${x} ${y - r}C${x + k} ${y - r} ${x + r} ${y - k} ${x + r} ${y}C${x + r} ${y + k} ${x + k} ${y + r} ${x} ${y + r}C${x - k} ${y + r} ${x - r} ${y + k} ${x - r} ${y}Z`;
};

/** Round wire glasses. All of them lie on the face, so they stay over the eyes as the head
 * turns: the rim ahead narrows with its eye. */
export const specs: Part = {
  id: "specs",
  slot: "eyewear",
  colors: ["2a2530"],
  layers: [
    {
      z: Z.eyewear,
      shapes: [
        { d: [face(rim(33.5, 60, 8.8))], stroke: "0", width: 1.8 },
        { d: [face(rim(66.5, 60, 8.8))], stroke: "0", width: 1.8 },
        { d: [face("M42.2 58.4Q50 54.4 57.8 58.4")], stroke: "0", width: 1.8 },
      ],
    },
  ],
};
