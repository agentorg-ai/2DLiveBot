import { face, type Part, Z } from "../../part.ts";

/** A full, untamed mane, parted near the middle and flaring out to both sides in three big,
 * round clumps each: one down by the jaw, the fullest at the cheek, one up by the temple. The
 * hairline sits high on the brow, with one lock fallen forward beside the parting and a tuft
 * at each temple. */
export const mane: Part = {
  id: "mane",
  slot: "hair",
  colors: ["9d99a4"],
  layers: [
    {
      // The hair behind the head, which fills in between each cheek and the mane.
      z: Z.behind,
      shapes: [
        {
          d: "M50 8C76 8 93 26 93 50C93 62 91.5 72 88 79C84 82 79 81 76 77L24 77C21 81 16 82 12 79C8.5 72 7 62 7 50C7 26 24 8 50 8Z",
          fill: "0",
        },
      ],
    },
    {
      z: Z.hair,
      shapes: [
        {
          d: [
            // The rim, clump by clump: three up the left side, two over the crown with the
            // parting between them, and three down the right side.
            "M16 78C12 82.5 3.5 81.5 1.5 74.5C0 69 3.5 64.5 8 63C1.5 62.5 -4 55.5 -2.5 48.5C-1.5 43.5 2.5 41 6.5 41.5C1 38.5 0 30.5 4 25.5C6.5 22.5 10 22.5 12 24.5C12.5 15.5 20 8 29 7C32 1.5 42 0.5 47.5 6.5C53 -0.5 66 -1 73 5.5C82 7.5 88.5 15.5 88 24.5C90 22.5 93.5 22.5 96 25.5C100 30.5 99 38.5 93.5 41.5C97.5 41 101.5 43.5 102.5 48.5C104 55.5 98.5 62.5 92 63C96.5 64.5 100 69 98.5 74.5C96.5 81.5 88 82.5 84 78",
            // The hairline: up the right cheek and round a tuft at the temple, across the brow
            // to the fallen lock and the parting, and the same down the left.
            face(
              "C85 72 84.5 66 83 60C79.5 58 78 53 80 49C78.5 46 77 43.5 75 41C70 36 63.5 32.5 57 31.5C57.5 35 56 39 53 39.5C50.5 39.8 49.8 36.5 50.5 33.5C50.8 31.5 51 30 51 28.5C49 30.5 46 31.5 43 32C36.5 33 30 36.5 25 41C23 43.5 21.5 46 20 49C22 53 20.5 58 17 60C15.5 66 15 72 16 77.5",
            ),
            "L16 78Z",
          ],
          fill: "0",
        },
      ],
    },
  ],
};
