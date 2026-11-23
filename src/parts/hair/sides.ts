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

/** The hair at one side of the head, drawn for the right and reflected for the left. It is
 * fullest beside the cheek, where its rim stands out past the head in two swells and tucks in
 * under the jaw. Upward it follows the head's curve and thins, fading to nothing short of the
 * crown. Its inner edge lies on the face. */
const side = (flip: (d: string) => string): Shape => ({
  d: [
    flip(
      "M68.6 25.75C74 26.5 80 29.5 84.5 34C89.5 37.5 96 40 97.5 46.5C97.8 52 96.8 56.5 94.5 59.5C97.5 63 97 71 92.5 75C89.5 78.5 84.5 79.5 80.5 77.5",
    ),
    face(
      flip(
        "C82.6 73.5 83.8 68 83.6 62.5C83.4 57 82.6 51 81.6 46C80.6 41 78 36.5 74.5 32.5C72.5 30 70.5 27.5 68.6 25.75",
      ),
    ),
    "Z",
  ],
  fill: "0",
});

/** Bald over the crown, with hair left at each side: full beside the cheeks and fading out
 * toward the top of the head. */
export const sides: Part = {
  id: "sides",
  slot: "hair",
  colors: ["4a3128"],
  layers: [{ z: Z.hair, shapes: [side((d) => d), side(mirror)] }],
};
