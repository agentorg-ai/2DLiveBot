import { face, type Part, Z } from "../../part.ts";

/** Short hair swept across the brow from a parting on one side: full over the crown, highest
 * on the side it sweeps to, with one flick out past the far temple. The fringe is choppy: four
 * locks of uneven length lean the way the hair is swept, each ending in a soft point with a
 * notch between it and the next, and a shorter lock falls the other way from the parting. The
 * hairline comes to a point at each sideburn. */
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
            // The rim: up the left side, over the crown, out to the flick, and down the right
            // side.
            "M14.5 63C11 55.5 9.5 45.5 12 36.5C13.5 24 24 12.5 38 9C50 5.5 66 5 77 10.5C84 14 89.5 21.5 90.5 30C92 33.5 93.5 37.5 94.5 41.5C92.5 41.5 91 42.5 90 44.5C90.5 51 89 57.5 85.5 63",
            // The hairline: the right sideburn's inner edge; the fringe's four locks, from the
            // one at the far temple back to the parting; the short lock; and down the left
            // temple and sideburn.
            face(
              "C84.8 57 83.8 52 82.5 48C81.5 49.5 79.5 50.2 77 49.5C75.5 46.5 73 43 70.5 40.5C70 42.5 68.5 44 66.5 44.5C64.5 42 62 39.5 59.5 37.5C59 40 57.5 42.2 55 43C53 40.5 50.5 37.5 48 35.5C47.5 37.5 46.2 39 44 39.5C42 37 39.5 33.5 37 30.5C34.5 31.5 32 33.5 30.5 36.5C29.8 35.5 29 34.6 28 34C25.5 36.5 23.5 40 22 44C20.5 48 19.6 52 19 55C18 58 16.8 60.5 15.5 62.5",
            ),
            "L14.5 63Z",
          ],
          fill: "0",
        },
      ],
    },
  ],
};
