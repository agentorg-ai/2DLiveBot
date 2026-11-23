import assert from "node:assert/strict";
import test from "node:test";
import { draw } from "../src/draw.ts";
import { face, PARTS, parseAvatar, toSvg } from "../src/index.ts";
import { pathText, segmentsOf } from "../src/path.ts";

const haired = "v1.round-e9c09c.dot-3a2f5b.waves-b4513a";

test("a still picture is SVG that carries no style, script or link", () => {
  const svg = toSvg(haired);
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="/);
  assert.doesNotMatch(svg, /style|script|href|url\(|<image/);
  // Its colours are the string's, and flat: no others are in it.
  assert.deepEqual([...new Set(svg.match(/#[0-9a-f]{6}/g))].sort(), [
    "#3a2f5b",
    "#b4513a",
    "#e9c09c",
  ]);
});

test("a picture is a square that fits its figure, with room to move", () => {
  assert.match(toSvg("v1"), /viewBox="7 12.5 86 86"/);
  // Hair reaches further than the face, so the square is larger.
  const [, , side] = draw(parseAvatar(haired)).viewBox.split(" ").map(Number);
  assert.ok(side !== undefined && side > 100 && side < 120);
});

test("parts are painted back to front: hair behind the head, the head, the eyes, the hair over it", () => {
  assert.deepEqual(
    draw(parseAvatar(haired)).shapes.map((shape) => shape.paint.fill),
    ["#b4513a", "#e9c09c", "#3a2f5b", "#3a2f5b", "#b4513a"],
  );
});

test("a shape turns when some of it lies on the face, and an eye lies on it whole", () => {
  assert.deepEqual(
    draw(parseAvatar(haired)).shapes.map((shape) => [shape.turns, shape.eye]),
    [
      [false, undefined],
      [false, undefined],
      [true, [33.5, 60]],
      [true, [66.5, 60]],
      [true, undefined],
    ],
  );
});

test("every hair is flat shapes whose rim stays and whose hairline is on the face", () => {
  const styles = PARTS.filter((part) => part.slot === "hair");
  assert.deepEqual(
    styles.map((part) => part.id),
    ["waves", "mane", "sweep", "buzz", "mohican", "sides"],
  );
  for (const part of styles) {
    const [behind, over] = [
      part.layers.filter((layer) => layer.z < 40).flatMap((layer) => layer.shapes),
      part.layers.filter((layer) => layer.z > 40).flatMap((layer) => layer.shapes),
    ];
    assert.ok(over.length > 0, part.id);
    for (const shape of over) {
      const onFace = segmentsOf(shape.d).map((segment) => segment.face);
      // A run of rim, a run of hairline, and the rim again to close.
      const runs = onFace.filter((on, i) => on !== onFace[i - 1]);
      assert.deepEqual(runs, [false, true, false], part.id);
      assert.equal(segmentsOf(shape.d).at(-1)?.command, "Z", part.id);
    }
    // What is behind the head has nothing on the face.
    for (const shape of behind)
      assert.ok(
        segmentsOf(shape.d).every((segment) => !segment.face),
        part.id,
      );
    // One flat colour: every shape of the hair is filled with it and has no line.
    for (const shape of [...behind, ...over])
      assert.deepEqual([shape.fill, shape.stroke], ["0", undefined], part.id);
  }
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
  // A long step on the face is cut into pieces that draw the same line, so that it keeps a
  // smooth curve when a turn moves its points; a long step off the face is left whole.
  const long = segmentsOf(["M0 0", face("C5 10 15 10 20 0L20 30"), "L0 30Z"]);
  assert.deepEqual(
    long.map((segment) => segment.command),
    ["M", "C", "C", "C", "C", "L", "L", "L", "L", "Z"],
  );
  assert.deepEqual(long[2]?.points.slice(-2), [10, 7.5], "the curve's middle is where it was");
  assert.deepEqual(long[5]?.points, [20, 10]);
  assert.deepEqual(long[8]?.points, [0, 30], "the step off the face is whole");
  assert.throws(() => segmentsOf("M1 2A3 3 0 0 1 4 5"), /uses A/);
  assert.throws(() => segmentsOf("M1 2 3"), /numbers/);
});

test("a size and a label are the picture's own", () => {
  const svg = toSvg("v1", { size: 40, label: 'Rose "the reviewer" <3' });
  assert.match(svg, / width="40" height="40" /);
  assert.match(svg, /role="img" aria-label="Rose &#34;the reviewer&#34; &#60;3"/);
  assert.match(toSvg("v1"), /aria-hidden="true"/);
});
