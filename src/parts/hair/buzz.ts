import { face, type Part, Z } from "../../part.ts";

/** A buzz cut: hair clipped short all over, so it is a cap that follows the head, a little
 * thicker over the crown than at the sides. It comes well down the brow, and its hairline is
 * one smooth arch from sideburn to sideburn. */
export const buzz: Part = {
  id: "buzz",
  slot: "hair",
  colors: ["2d2630"],
  layers: [
    {
      z: Z.hair,
      shapes: [
        {
          d: [
            // The rim: outside the head, from one sideburn over the crown to the other.
            "M12.4 60C10.2 58.5 9.3 56.5 9.3 54.5C9.3 32.5 25 17.5 50 17.5C75 17.5 90.7 32.5 90.7 54.5C90.7 56.5 89.8 58.5 87.6 60",
            // The hairline: one arch, up the right sideburn, across the brow, and down the
            // left.
            face(
              "C86.2 53.5 83.5 47.5 79 43C72 37 61.5 34.5 50 34.5C38.5 34.5 28 37 21 43C16.5 47.5 13.8 53.5 12.9 58",
            ),
            "L12.4 60Z",
          ],
          fill: "0",
        },
      ],
    },
  ],
};
