import { face, type Part, Z } from "../../part.ts";

/** Short at the sides and swept up in front: a small swell at the back of the crown, then a
 * tall wave that rises across the head, crests high over one side and curls over to a point,
 * with a notch under it. The hairline comes to a soft point over the brow and to a point at
 * each sideburn. */
export const quiff: Part = {
  id: "quiff",
  slot: "hair",
  colors: ["2d2630"],
  layers: [
    {
      z: Z.hair,
      shapes: [
        {
          d: [
            // The rim: up the left side, over the small swell, along the wave to its crest
            // and curled-over point, back under the point, and down the right side.
            "M14.5 63C11 55.5 9.5 45.5 12.5 36.5C13.5 29 17.5 22.5 23.5 18.5C24 12 29.5 6.5 36 6C37.5 7.5 38.5 9 39 10.5C43.5 3.5 52 -2 61 -3C70 -3.5 79 0.5 85 7.5C88.8 12 91.6 16.5 92.5 21.5C88.5 18.5 84 18.5 80.5 21.5C85 26.5 88.5 34 89 42.5C89.5 50.5 88.5 57.5 85.5 63",
            // The hairline: each sideburn's inner edge, and between them the brow's line with
            // its point.
            face(
              "C84.5 56 83.5 50 81 45.5C78.5 41.5 75 38 71.5 36C68.5 32.5 65 30.5 61.5 30C58.5 30.5 55 32 52 34.5C49.5 31.5 46.5 29.8 43 29.5C37 30 31.5 33 27.5 37.5C23.5 42 21 48 19.5 54C18.3 57.5 16.8 60.5 15.5 62.5",
            ),
            "L14.5 63Z",
          ],
          fill: "0",
        },
      ],
    },
  ],
};
