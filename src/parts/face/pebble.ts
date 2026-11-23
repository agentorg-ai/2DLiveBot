import { type Part, Z } from "../../part.ts";

/** A wide head squared off like a worn pebble: nearly flat at its crown, chin and sides, with
 * full round corners. Its colour is the avatar's skin. */
export const pebble: Part = {
  id: "pebble",
  slot: "face",
  colors: ["f7e3cf"],
  layers: [
    {
      z: Z.head,
      on: "head",
      shapes: [
        {
          d: "M12.5 55.5C12.5 29 20 22.5 50 22.5C80 22.5 87.5 29 87.5 55.5C87.5 82 80 88.5 50 88.5C20 88.5 12.5 82 12.5 55.5Z",
          fill: "0",
        },
      ],
    },
  ],
};
