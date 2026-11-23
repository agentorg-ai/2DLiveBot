import { face, type Part, Z } from "../../part.ts";

/** A short crop parted on one side, with a loose tuft at the crown. Its lower edge is the
 * hairline, on the face. */
export const crop: Part = {
  id: "crop",
  slot: "hair",
  colors: ["2d2630"],
  layers: [
    {
      z: Z.hair,
      shapes: [
        {
          d: [
            "M10 56C7 29 26 15.5 50 15.5C74 15.5 93 29 90 56",
            face(
              "C88.5 48.5 85.5 41.5 80.5 37C71.5 31 59.5 31 51.5 34C44.5 36.5 38.5 35 34.5 31C29.5 35.5 21.5 40.5 16.5 44.5",
            ),
            "C13.5 47.5 11.5 51.5 10 56Z",
          ],
          fill: "0",
        },
        {
          d: "M43.5 18C41.5 12 46 6.5 54.5 5.5C52 9 53.5 11.5 57 13C60.5 14.5 61.5 17.5 58.5 20Z",
          fill: "0",
        },
      ],
    },
  ],
};
