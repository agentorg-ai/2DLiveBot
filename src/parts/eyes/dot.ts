import { type Layer, type Part, type Point, Z } from "../../part.ts";

/** A dot a little taller than wide, about a point on the face. */
const eye = (at: Point): Layer => {
  const [x, y] = at;
  const [rx, ry, kx, ky] = [3.4, 4.2, 1.88, 2.32];
  return {
    z: Z.features,
    eye: at,
    shapes: [
      {
        d: `M${x - rx} ${y}C${x - rx} ${y - ky} ${x - kx} ${y - ry} ${x} ${y - ry}C${x + kx} ${y - ry} ${x + rx} ${y - ky} ${x + rx} ${y}C${x + rx} ${y + ky} ${x + kx} ${y + ry} ${x} ${y + ry}C${x - kx} ${y + ry} ${x - rx} ${y + ky} ${x - rx} ${y}Z`,
        fill: "0",
      },
    ],
  };
};

/** Two small dots, set wide a little below the middle of the face. */
export const dot: Part = {
  id: "dot",
  slot: "eyes",
  colors: ["2a2530"],
  layers: [eye([33.5, 60]), eye([66.5, 60])],
};
