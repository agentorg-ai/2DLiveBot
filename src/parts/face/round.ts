import { type Part, Z } from "../../part.ts";

/** A soft, wide oval, the same above as below. Its colour is the avatar's skin. */
export const round: Part = {
  id: "round",
  slot: "face",
  colors: ["f7e3cf"],
  layers: [
    {
      z: Z.head,
      on: "head",
      shapes: [
        {
          d: "M12 55.5C12 35 26.4 22.5 50 22.5C73.6 22.5 88 35 88 55.5C88 76 73.6 88.5 50 88.5C26.4 88.5 12 76 12 55.5Z",
          fill: "0",
        },
      ],
    },
  ],
};
