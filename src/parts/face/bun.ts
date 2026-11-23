import { type Part, Z } from "../../part.ts";

/** A wide, soft head: full at the cheeks, narrower at the crown and nearly flat at the chin. Its
 * colour is the avatar's skin. */
export const bun: Part = {
  id: "bun",
  slot: "face",
  colors: ["f7e3cf"],
  layers: [
    {
      z: Z.head,
      on: "head",
      shapes: [
        {
          d: "M50 22C67 22 80.5 30 85 45.5C88 55.5 88.6 67.5 84.6 76C80.5 85 67 88.5 50 88.5C33 88.5 19.5 85 15.4 76C11.4 67.5 12 55.5 15 45.5C19.5 30 33 22 50 22Z",
          fill: "0",
        },
      ],
    },
  ],
};
