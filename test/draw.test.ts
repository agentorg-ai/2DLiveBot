import assert from "node:assert/strict";
import test from "node:test";
import { draw } from "../src/draw.ts";
import { face, parseAvatar, toSvg } from "../src/index.ts";
import { pathText, segmentsOf } from "../src/path.ts";

const dressed = "v1.round-e9c09c.dot-3a2f5b.bob-b4513a.specs-7a4a35.beanie-4f7cac";

test("a still picture is SVG that carries no style, script or link", () => {
  const svg = toSvg(dressed);
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="/);
  assert.doesNotMatch(svg, /style|script|href|url\(|<image/);
  // Its colours are the string's, each as it is or in its shade.
  for (const color of ["e9c09c", "3a2f5b", "b4513a", "7a4a35", "4f7cac"])
    assert.ok(svg.includes(`#${color}`), color);
  assert.equal(new Set(svg.match(/#[0-9a-f]{6}/g)).size, 7);
});

test("a picture is a square that fits its figure, with room to move", () => {
  assert.match(toSvg("v1"), /viewBox="6 11.5 88 88"/);
  // Hair and a hat reach further than the face, so the square is larger.
  const [, , side] = draw(parseAvatar(dressed)).viewBox.split(" ").map(Number);
  assert.ok(side !== undefined && side > 95 && side < 110);
});

test("parts are painted back to front: hair behind, the head, the eyes, glasses, hair, the hat", () => {
  const colours = draw(parseAvatar(dressed)).shapes.map((shape) => shape.paint.stroke);
  const first = (color: string) => colours.indexOf(`#${color}`);
  const last = (color: string) => colours.lastIndexOf(`#${color}`);
  // The mass behind the head is in the hair's shade, which is no colour of the string.
  assert.ok(first("e9c09c") === 1 && colours[0] !== "#b4513a");
  assert.ok(first("e9c09c") < first("3a2f5b") && last("3a2f5b") < first("7a4a35"));
  assert.ok(last("7a4a35") < first("b4513a") && first("b4513a") < first("4f7cac"));
});

test("a shape turns when some of it lies on the face, and an eye lies on it whole", () => {
  const { shapes } = draw(parseAvatar("v1.bob.specs"));
  assert.deepEqual(
    shapes.map((shape) => [shape.turns, shape.eye]),
    [
      [false, undefined],
      [false, undefined],
      [true, [33.5, 60]],
      [true, [66.5, 60]],
      [true, undefined],
      [true, undefined],
      [true, undefined],
      [true, undefined],
    ],
  );
});

test("a path is read stretch by stretch, and written back as it was drawn", () => {
  const segments = segmentsOf(["M1 2L3 4", face("C5 6 7 8 9 10 11 12 13 14 15 16"), "Q1 1 2 2Z"]);
  assert.deepEqual(
    segments.map((segment) => [segment.command, segment.points.length, segment.face]),
    [
      ["M", 2, false],
      ["L", 2, false],
      ["C", 6, true],
      ["C", 6, true],
      ["Q", 4, false],
      ["Z", 0, false],
    ],
  );
  assert.equal(pathText(segments), "M1 2L3 4C5 6 7 8 9 10C11 12 13 14 15 16Q1 1 2 2Z");
  // Only what lies on the face is moved.
  assert.equal(
    pathText(segments, (x, y) => [x + 100, y]),
    "M1 2L3 4C105 6 107 8 109 10C111 12 113 14 115 16Q1 1 2 2Z",
  );
  assert.throws(() => segmentsOf("M1 2A3 3 0 0 1 4 5"), /uses A/);
  assert.throws(() => segmentsOf("M1 2 3"), /numbers/);
});

test("a size and a label are the picture's own", () => {
  const svg = toSvg("v1", { size: 40, label: 'Rose "the reviewer" <3' });
  assert.match(svg, / width="40" height="40" /);
  assert.match(svg, /role="img" aria-label="Rose &#34;the reviewer&#34; &#60;3"/);
  assert.match(toSvg("v1"), /aria-hidden="true"/);
});
