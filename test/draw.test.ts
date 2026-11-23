import assert from "node:assert/strict";
import test from "node:test";
import { draw } from "../src/draw.ts";
import { parseAvatar, toSvg } from "../src/index.ts";

test("a still picture is SVG that carries no style, script or link", () => {
  const svg = toSvg("v1.bun-e9c09c.dot-3a2f5b");
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="5 9 90 90"/);
  assert.doesNotMatch(svg, /style|script|href|url\(|<image/);
  // Its colours are the string's, and flat.
  assert.deepEqual([...new Set(svg.match(/#[0-9a-f]{6}/g))], ["#e9c09c", "#3a2f5b"]);
});

test("the plain avatar is a head and two eyes, each eye a layer with its own place", () => {
  const { groups } = draw(parseAvatar("v1"));
  assert.deepEqual(
    groups.map((group) => [group.on, group.at]),
    [
      ["head", undefined],
      ["eyes", [33.5, 60]],
      ["eyes", [66.5, 60]],
    ],
  );
});

test("a size and a label are the picture's own", () => {
  const svg = toSvg("v1", { size: 40, label: 'Rose "the reviewer" <3' });
  assert.match(svg, / width="40" height="40" /);
  assert.match(svg, /role="img" aria-label="Rose &#34;the reviewer&#34; &#60;3"/);
  assert.match(toSvg("v1"), /aria-hidden="true"/);
});
