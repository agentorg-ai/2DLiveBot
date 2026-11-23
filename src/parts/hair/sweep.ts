import { face, type Part, Z } from "../../part.ts";

/** Short hair swept across the brow from a parting on one side: full over the crown, highest
 * on the side it sweeps to. The fringe falls in two soft scallops to a rounded tip at the far
 * temple, and the hairline comes to a point at each sideburn. */
export const sweep: Part = {
  id: "sweep",
  slot: "hair",
  colors: ["2d2630"],
  layers: [
    {
      z: Z.hair,
      shapes: [
        {
          d: [
            // The rim: up the left side, over the crown, and down the right side.
            "M14.5 63C11 55.5 9.5 45.5 12 36.5C13.5 24 24 12.5 38 9C50 5.5 66 5 77 10.5C84 14 89.5 21.5 90.5 30C91.5 36 91 42 89.5 47C90 53 88.5 58.5 85.5 63",
            // The hairline: the right sideburn's inner edge, the fringe's tip and its two
            // scallops up to the parting, and down the left temple and sideburn.
            face(
              "C84.8 57 83.8 52 82.5 48C80.5 50.5 77 50.5 75 47.5C71 47 66 45 62.5 41.5C57.5 41 51.5 38 48 34C43.5 33.5 38.5 31.5 35 29C30.5 31 26.5 35 23.5 40.5C21 45 19.8 50 19 55C18 58 16.8 60.5 15.5 62.5",
            ),
            "L14.5 63Z",
          ],
          fill: "0",
        },
      ],
    },
  ],
};
