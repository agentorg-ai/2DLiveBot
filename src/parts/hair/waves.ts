import { face, type Part, Z } from "../../part.ts";

/** Thick, curling hair parted off-centre, in one flat colour: its character is its outline.
 * The rim swells in curls of different sizes, fullest over the crown, and each lock ends in a
 * curl. The hairline is a long, scalloped sweep across the brow to one side, a short one to the
 * other, a small curl hanging from the parting, and curls that lie against the cheeks. The rim
 * stays with the head and the hairline is on the face. */
export const waves: Part = {
  id: "waves",
  slot: "hair",
  colors: ["5b3a2c"],
  layers: [
    {
      // The hair behind the head, which fills in beside the jaw and wherever a turn opens a
      // gap between the face and the hairline.
      z: Z.behind,
      shapes: [
        {
          d: "M50 7C77 7 94 25 94 50C94 65 92 76 88.5 84C84 88 77 87 73 81L27 81C23 87 16 88 11.5 84C8 76 6 65 6 50C6 25 23 7 50 7Z",
          fill: "0",
        },
      ],
    },
    {
      z: Z.hair,
      shapes: [
        {
          d: [
            // The rim, curl by curl, from the left lock's end up over the crown and down to
            // the right lock's.
            "M15 85C12 89.5 5.5 90 3 85.5C0.5 81 3 76 7 76.5C3.5 72.5 1.5 66 4.5 61.5C0 57 -0.5 47.5 4.5 43.5C1.5 38 3 28 9.5 24.5C9 17 15.5 9.5 23.5 9C26.5 4 35.5 2.5 40.5 7C44.5 1.5 56 -0.5 62.5 3.5C70.5 1.5 80 6 82.5 13C90 14.5 95.5 22.5 93.5 30C99.5 33.5 101 44 96 49C100.5 54 100 63.5 94.5 67C98.5 70 99.5 77.5 95.5 80.5C97.5 85.5 93 90 87.5 88.5C85.5 88 84.5 86 84.5 84",
            // The hairline: the curls against the right cheek, the long sweep to the parting
            // and the curl that hangs from it, the short sweep, and the curls against the left
            // cheek.
            face(
              "C80.5 82 79 76 82.5 72C78 69 77.5 61.5 81.5 57.5C78.5 54.5 77.5 49.5 79.5 46C74.5 47.5 69 45.5 66 41.5C61 42.5 55 39 53 34.5C49 35 44.5 31.5 43 27C44.5 31 42 35.5 38.5 34.5C36 33.8 35.5 30.5 37.5 29C34.5 29 31 30.5 29 33.5C25.5 33.5 21.5 37.5 21 42.5C22.5 46 23 51.5 19.5 55C22.5 58.5 22.5 66 18.5 69.5C21.5 73 20.5 79.5 16.5 82",
            ),
            "C16 83.2 15.5 84.2 15 85Z",
          ],
          fill: "0",
        },
      ],
    },
  ],
};
