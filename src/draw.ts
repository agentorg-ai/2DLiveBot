// An avatar as a drawing: its parts' layers in paint order, each shape with its colour worked
// out, and the same drawing as SVG text.
import { type Layer, type Point, SLOTS } from "./part.ts";
import { partOf } from "./parts/index.ts";
import { type Avatar, parseAvatar } from "./string.ts";

/** Shapes that move as one, each as the attributes of an SVG path. */
export type Group = { on: Layer["on"]; at?: Point; shapes: Record<string, string>[] };
export type Drawing = { viewBox: string; groups: Group[] };

/** The part of the drawing space a picture shows: the head, with room to move. */
const VIEW = "5 9 90 90";
/** A shape's edge: a rim of its own colour, half seen, so it meets what is behind it softly. */
const EDGE = { "stroke-width": "1.2", "stroke-opacity": "0.45", "stroke-linejoin": "round" };

/** The drawing of an avatar: a group for each layer, back to front. */
export function draw(avatar: Avatar): Drawing {
  const layers = SLOTS.flatMap((slot) => {
    const choice = avatar[slot];
    const part = choice && partOf(choice.id);
    return part ? part.layers.map((layer) => ({ layer, colors: choice.colors })) : [];
  }).sort((a, b) => a.layer.z - b.layer.z);
  const groups = layers.map(({ layer, colors }) => ({
    on: layer.on,
    at: layer.at,
    shapes: layer.shapes.map((shape) => {
      const fill = shape.fill.startsWith("#") ? shape.fill : `#${colors[Number(shape.fill)]}`;
      return { d: shape.d, fill, stroke: fill, ...EDGE };
    }),
  }));
  return { viewBox: VIEW, groups };
}

const inText = (text: string) => text.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

/** A still picture of the avatar a string names, as SVG text: for an image's `src`, a file, or a
 * page made on a server. With a label it is an image to a screen reader; without, it is hidden
 * from one. */
export function toSvg(text: string, options: { size?: number; label?: string } = {}): string {
  const { viewBox, groups } = draw(parseAvatar(text));
  const size = options.size ? ` width="${options.size}" height="${options.size}"` : "";
  const name = options.label
    ? ` role="img" aria-label="${inText(options.label)}"`
    : ` aria-hidden="true"`;
  const body = groups.map(({ shapes }) => {
    const paths = shapes.map(
      (path) =>
        `<path ${Object.entries(path)
          .map(([key, value]) => `${key}="${inText(value)}"`)
          .join(" ")}/>`,
    );
    return `<g>${paths.join("")}</g>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"${size}${name}>${body.join("")}</svg>`;
}
