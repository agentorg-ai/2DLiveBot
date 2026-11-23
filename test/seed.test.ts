import assert from "node:assert/strict";
import test from "node:test";
import { avatarFromSeed, parseAvatar } from "../src/index.ts";

test("a seed's avatar is the same on every machine and in every release", () => {
  // Written out, so that a change to how a seed chooses fails here.
  assert.deepEqual(
    ["", "release-notes", "agent-1", "7f3a9c2e-1b4d-4e8a-9c0f-2d6b5a8e1f37"].map(avatarFromSeed),
    [
      "v1.round-f4d6b8.dot-2a2530",
      "v1.round-d2a078.dot-2a2530",
      "v1.round-ab7852.dot-2a2530",
      "v1.round-80533a.dot-2a2530",
    ],
  );
});

test("seeds spread over what there is to choose, each a face and eyes and nothing else yet", () => {
  const made = Array.from({ length: 200 }, (_, i) => avatarFromSeed(`agent-${i}`));
  for (const text of made) assert.deepEqual(Object.keys(parseAvatar(text)), ["face", "eyes"]);
  const skins = new Set(made.map((text) => parseAvatar(text).face?.colors[0]));
  assert.equal(skins.size, 6);
});
