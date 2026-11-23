import { face, type Part, Z } from "../../part.ts";

/** A buzz cut: hair clipped short all over, so it is a cap that follows the head, thicker over
 * the crown and thin down the sides. It comes well down the brow, and its hairline is one
 * smooth arch from sideburn to sideburn. */
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
            // The rim: close to the head at the sides and higher over the crown, from one
            // sideburn to the other.
            "M12.6 57C11.2 56 10.6 54.5 10.6 53C10.6 31.5 25.5 17.5 50 17.5C74.5 17.5 89.4 31.5 89.4 53C89.4 54.5 88.8 56 87.4 57",
            // The hairline: one arch, up the right sideburn, across the brow, and down the
            // left.
            face(
              "C86.8 53.5 85.6 50 83.5 47C77 41.5 64 39.5 50 39.5C36 39.5 23 41.5 16.5 47C14.4 50 13.2 53.5 12.9 56",
            ),
            "L12.6 57Z",
          ],
          fill: "0",
        },
      ],
    },
  ],
};
