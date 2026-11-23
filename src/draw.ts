// An avatar as a drawing: its shapes in paint order, each with its colours worked out and its
// path read into points, and the same drawing as SVG text.
import { type Paint, type Point, SLOTS } from "./part.ts";
import { partOf } from "./parts/index.ts";
import { pathText, type Segment, segmentsOf } from "./path.ts";
import { type Avatar, parseAvatar } from "./string.ts";

/** One shape of the drawing. */
export type Drawn = {
  /** The attributes of its SVG path, but for the path itself. */
  paint: Record<string, string>;
  segments: Segment[];
  /** The middle of the eye it is part of. */
  eye?: Point;
  /** Whether any of it lies on the face, and so moves as the head turns. */
  turns: boolean;
};
export type Drawing = { viewBox: string; shapes: Drawn[] };

/** The room a picture leaves round the figure, for it to move in. */
const ROOM = 5;

/** The drawing of an avatar: its shapes back to front, in a square that fits the figure. */
export function draw(avatar: Avatar): Drawing {
  const layers = SLOTS.flatMap((slot) => {
    const choice = avatar[slot];
    const part = choice && partOf(choice.id);
    return part ? part.layers.map((layer) => ({ layer, colors: choice.colors })) : [];
  }).sort((a, b) => a.layer.z - b.layer.z);

  const shapes = layers.flatMap(({ layer, colors }) =>
    layer.shapes.map((shape): Drawn => {
      const color = (paint: Paint) =>
        paint.startsWith("#") ? paint : `#${colors[Number(paint)] ?? "000000"}`;
      const paint: Record<string, string> = { fill: shape.fill ? color(shape.fill) : "none" };
      if (shape.stroke)
        Object.assign(paint, {
          stroke: color(shape.stroke),
          "stroke-width": String(shape.width ?? 1),
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
        });
      const segments = segmentsOf(shape.d, layer.eye !== undefined);
      return { paint, segments, eye: layer.eye, turns: segments.some((segment) => segment.face) };
    }),
  );

  // The square that holds every point, with room round it.
  const xs = shapes.flatMap((shape) =>
    shape.segments.flatMap((s) => s.points.filter((_, i) => i % 2 === 0)),
  );
  const ys = shapes.flatMap((shape) =>
    shape.segments.flatMap((s) => s.points.filter((_, i) => i % 2 === 1)),
  );
  const [left, right, top, bottom] = [
    Math.min(...xs),
    Math.max(...xs),
    Math.min(...ys),
    Math.max(...ys),
  ];
  const side = Math.ceil(Math.max(right - left, bottom - top)) + ROOM * 2;
  const corner = [(left + right - side) / 2, (top + bottom - side) / 2].map(
    (v) => Math.round(v * 10) / 10,
  );
  return { viewBox: `${corner[0]} ${corner[1]} ${side} ${side}`, shapes };
}

const inText = (text: string) => text.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

/** A still picture of the avatar a string names, as SVG text: for an image's `src`, a file, or a
 * page made on a server. With a label it is an image to a screen reader; without, it is hidden
 * from one. */
export function toSvg(text: string, options: { size?: number; label?: string } = {}): string {
  const { viewBox, shapes } = draw(parseAvatar(text));
  const size = options.size ? ` width="${options.size}" height="${options.size}"` : "";
  const name = options.label
    ? ` role="img" aria-label="${inText(options.label)}"`
    : ` aria-hidden="true"`;
  const paths = shapes.map(
    ({ paint, segments }) =>
      `<path ${Object.entries({ d: pathText(segments), ...paint })
        .map(([key, value]) => `${key}="${inText(value)}"`)
        .join(" ")}/>`,
  );
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"${size}${name}><g>${paths.join("")}</g></svg>`;
}
