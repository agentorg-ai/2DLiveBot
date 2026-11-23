import { face, type Part, type Shape, Z } from "../../part.ts";

/** A path's reflection across the figure's middle. */
const mirror = (d: string) => {
  let x = true;
  return d.replace(/-?\d+(\.\d+)?|[A-Za-z]/g, (token) => {
    if (/[A-Za-z]/.test(token)) {
      x = true;
      return token;
    }
    const value = x ? String(Math.round((100 - Number(token)) * 100) / 100) : token;
    x = !x;
    return value;
  });
};

/** The hair at one side of the head, drawn for the right and reflected for the left. Its rim
 * stands out past the head from the temple down to the jaw, in a flick at the top and two
 * swells below it, and tucks in under the cheek; its inner edge lies on the face. */
const side = (flip: (d: string) => string): Shape => ({
  d: [
    flip(
      "M81 35C82.5 31.5 85.5 28.5 89.5 27.5C89 30 90.5 32 92.5 33.5C95.5 36.5 97.5 41.5 97.5 46.5C97.8 52 96.8 56.5 94.5 59.5C97.5 63 97 71 92.5 75C89.5 78.5 84.5 79.5 80.5 77.5",
    ),
    face(
      flip(
        "C82.6 73.5 83.8 68 83.6 62.5C83.4 57 82.6 51 81.6 46C80.8 42.5 80 39.5 79.8 38C79.7 36.8 80.2 35.8 81 35",
      ),
    ),
    "Z",
  ],
  fill: "0",
});

/** Bald over the crown, with hair left at each side: a mass that stands out past the head from
 * the temple down to the jaw. */
export const sides: Part = {
  id: "sides",
  slot: "hair",
  colors: ["4a3128"],
  layers: [{ z: Z.hair, shapes: [side((d) => d), side(mirror)] }],
};
