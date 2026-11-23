import assert from "node:assert/strict";
import test from "node:test";
import { AvatarStringError, avatarFromSeed, formatAvatar, parseAvatar } from "../src/index.ts";

test("v1 alone is the plain avatar: a face and eyes, each with its own colour", () => {
  assert.deepEqual(parseAvatar("v1"), {
    face: { id: "round", colors: ["f7e3cf"] },
    eyes: { id: "dot", colors: ["2a2530"] },
  });
  assert.equal(formatAvatar(parseAvatar("v1")), "v1.round-f7e3cf.dot-2a2530");
});

test("an avatar has one string: parts in the slots' order, each with every colour", () => {
  const one = "v1.bun-e9c09c.dot-3a2f5b";
  assert.equal(formatAvatar(parseAvatar(one)), one);
  // Written by hand: out of order, colours left out.
  assert.equal(formatAvatar(parseAvatar("v1.dot.bun-e9c09c")), "v1.bun-e9c09c.dot-2a2530");
});

test("a later part in a slot replaces an earlier one", () => {
  assert.equal(parseAvatar("v1.round.pebble-112233").face?.id, "pebble");
});

test("a string from a later catalog still draws: unknown parts and extra colours are passed over", () => {
  assert.deepEqual(
    parseAvatar("v1.bun-e9c09c-445566.halo-ffffff.scarf"),
    parseAvatar("v1.bun-e9c09c"),
  );
});

test("text that is not an avatar's string is refused, as is another format", () => {
  for (const text of ["", "round", "v1.", "v1.Bun", "v1.bun-12345", "v1.bun-GGGGGG", "v1 .bun"])
    assert.throws(() => parseAvatar(text), AvatarStringError, text);
  assert.throws(() => parseAvatar("v2.round"), /format v2/);
});

test("a string goes into a URL and into JSON as it is", () => {
  for (const seed of ["release-notes", "Ünïcödé agent / 7", ""]) {
    const text = avatarFromSeed(seed);
    assert.match(text, /^[a-z0-9.-]+$/);
    assert.equal(encodeURIComponent(text), text);
    assert.equal(JSON.stringify(text), `"${text}"`);
  }
});

test("settings that cannot be written are refused", () => {
  assert.throws(() => formatAvatar({ face: { id: "Round", colors: [] } }), AvatarStringError);
  assert.throws(() => formatAvatar({ face: { id: "round", colors: ["red"] } }), AvatarStringError);
});
