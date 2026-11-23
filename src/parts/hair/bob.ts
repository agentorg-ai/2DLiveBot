import { face, type Part, Z } from "../../part.ts";

/** A smooth bob that wraps the head: a mass behind it, and over it a fringe with a lock down
 * each cheek. The fringe and the locks' inner edges are the hairline, on the face. */
export const bob: Part = {
  id: "bob",
  slot: "hair",
  colors: ["5a3a2a"],
  layers: [
    {
      z: Z.behind,
      shapes: [
        {
          d: "M50 5.5C76 5.5 94.5 24 94.5 51C94.5 67 91.5 79 86 88C81.5 91.5 76 90.5 73.5 86.5L26.5 86.5C24 90.5 18.5 91.5 14 88C8.5 79 5.5 67 5.5 51C5.5 24 24 5.5 50 5.5Z",
          fill: "0-",
        },
      ],
    },
    {
      z: Z.hair,
      shapes: [
        {
          d: [
            "M9 60C5 29 24 6.5 50 6.5C76 6.5 95 29 91 60C90.2 67.5 88.5 73.5 86 78.5",
            face(
              "C85 71 83.5 63 81 56.5C78 47.5 73 41.5 66 38C56 42 44 42 34 38C27 41.5 22 47.5 19 56.5C16.5 63 15 71 14 78.5",
            ),
            "C11.5 73.5 9.8 67.5 9 60Z",
          ],
          fill: "0",
        },
      ],
    },
  ],
};
