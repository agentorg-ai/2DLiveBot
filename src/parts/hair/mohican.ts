import { face, type Part, Z } from "../../part.ts";

/** A Mohican: the sides of the head bare, and one strip of hair down the middle standing up in
 * a crest. From the front the crest is a fan of five pointed tufts, the tallest in the middle,
 * and the strip's front end comes to a point on the brow. The crest stays with the head's
 * outline and the strip's front end is on the face, so in a turn the crest leans the way the
 * head turns. */
export const mohican: Part = {
  id: "mohican",
  slot: "hair",
  colors: ["2d2630"],
  layers: [
    {
      z: Z.hair,
      shapes: [
        {
          d: [
            // The rim: up the crest's left edge, tuft by tuft over the top, and down its right
            // edge to just above the head.
            "M39 21C37.5 18 35 15.5 33 12.5C35.5 12.5 37.8 13.2 39.5 14.5C39 10.5 39 6 40 1.5C42 4 44 7 45.5 9.5C46.5 5 48 0 50 -5C52 0 53.5 5 54.5 9.5C56 7 58 4 60 1.5C61 6 61 10.5 60.5 14.5C62.2 13.2 64.5 12.5 67 12.5C65 15.5 62.5 18 61 21",
            // The strip's front end: down its right side, round its point on the brow, and
            // back up its left side.
            face(
              "C60.6 24 60.2 27 59.5 30C58.5 32.5 55 35 50 37C45 35 41.5 32.5 40.5 30C39.8 27 39.4 24 39 21",
            ),
            "Z",
          ],
          fill: "0",
        },
      ],
    },
  ],
};
