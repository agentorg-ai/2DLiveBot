import { face, type Part, Z } from "../../part.ts";

/** A knitted beanie pulled down to the brow. Its crown stays with the head's outline and runs
 * on under the band; the turned-up band's edges are on the face, so the band goes with the
 * brow. */
export const beanie: Part = {
  id: "beanie",
  slot: "headwear",
  colors: ["d98b5f"],
  layers: [
    {
      z: Z.headwear,
      shapes: [
        {
          d: "M8.5 41C7 17 26 3.5 50 3.5C74 3.5 93 17 91.5 41C78 36 22 36 8.5 41Z",
          fill: "0",
        },
        {
          d: [
            "M7.5 33",
            face("C22 27.5 78 27.5 92.5 33"),
            "C94.5 36.5 94.5 40.5 92.5 43.5",
            face("C78 38 22 38 7.5 43.5"),
            "C5.5 40.5 5.5 36.5 7.5 33Z",
          ],
          fill: "0-",
        },
      ],
    },
  ],
};
