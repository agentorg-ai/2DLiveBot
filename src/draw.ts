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

/** A filled shape's edge: a rim of its own colour, half seen, so it meets what is behind it
 * softly. */
const EDGE = { "stroke-width": "1.2", "stroke-opacity": "0.45", "stroke-linejoin": "round" };
/** The room a picture leaves round the figure, for it to move in. */
const ROOM = 6;

const channels = (hex: string) => [0, 2, 4].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));
/** A colour in shade: a fifth of the way to a cool dark, as flat colour is shaded by hand. */
const shade = (hex: string) =>
  channels(hex)
    .map((value, i) => Math.round(value + ((channels("34203f")[i] ?? value) - value) * 0.2))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");

/** The drawing of an avatar: its shapes back to front, in a square that fits the figure. */
export function draw(avatar: Avatar): Drawing {
  const layers = SLOTS.flatMap((slot) => {
    const choice = avatar[slot];
    const part = choice && partOf(choice.id);
    return part ? part.layers.map((layer) => ({ layer, colors: choice.colors })) : [];
  }).sort((a, b) => a.layer.z - b.layer.z);

  const shapes = layers.flatMap(({ layer, colors }) =>
    layer.shapes.map((shape): Drawn => {
      const color = (paint: Paint) => {
        if (paint.startsWith("#")) return paint;
        const own = colors[Number.parseInt(paint, 10)] ?? "000000";
        return `#${paint.endsWith("-") ? shade(own) : own}`;
      };
      const paint: Record<string, string> = { fill: "none" };
      if (shape.fill)
        Object.assign(paint, { fill: color(shape.fill), stroke: color(shape.fill) }, EDGE);
      if (shape.stroke)
        Object.assign(paint, {
          stroke: color(shape.stroke),
          "stroke-width": String(shape.width ?? 1),
          "stroke-opacity": "1",
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
