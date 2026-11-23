import assert from "node:assert/strict";
import test from "node:test";
import { avatarFromSeed, parseAvatar } from "../src/index.ts";

test("a seed's avatar is the same on every machine and in every release", () => {
  // Written out, so that a change to how a seed chooses fails here.
  assert.deepEqual(
    ["", "release-notes", "agent-1", "7f3a9c2e-1b4d-4e8a-9c0f-2d6b5a8e1f37"].map(avatarFromSeed),
    [
      "v1.round-f4d6b8.dot-2a2530.mane-4a3128",
      "v1.round-ab7852.dot-2a2530.mane-5b3a2c.specs-2a2530",
      "v1.round-ab7852.dot-3b2a22.mane-453c4d.specs-7d2f3a",
      "v1.round-80533a.dot-2a2530.waves-c2703d.specs-2a2530",
    ],
  );
});

const made = Array.from({ length: 5000 }, (_, i) => parseAvatar(avatarFromSeed(`agent-${i}`)));
const share = (count: number) => count / made.length;

test("seeds spread over every slot: skins, hair styles and colours, and glasses for some", () => {
  assert.equal(new Set(made.map((avatar) => avatar.face?.colors[0])).size, 5);
  assert.ok(new Set(made.map((avatar) => avatar.eyes?.colors[0])).size >= 3);
  assert.deepEqual([...new Set(made.map((avatar) => avatar.hair?.id ?? "none"))].sort(), [
    "mane",
    "none",
    "sides",
    "sweep",
    "waves",
  ]);
  assert.ok(new Set(made.map((avatar) => avatar.hair?.colors[0])).size >= 10);
  const bald = share(made.filter((avatar) => !avatar.hair).length);
  assert.ok(bald > 0.03 && bald < 0.15, `${bald} of heads are bald`);
  const glasses = share(made.filter((avatar) => avatar.eyewear).length);
  assert.ok(glasses > 0.28 && glasses < 0.32, `${glasses} wear glasses`);
});

test("a seed's hair and frames are never a colour close to its skin's", () => {
  const channels = (color = "") => [0, 2, 4].map((i) => Number.parseInt(color.slice(i, i + 2), 16));
  for (const avatar of made) {
    const skin = channels(avatar.face?.colors[0]);
    for (const part of [avatar.hair, avatar.eyewear]) {
      if (!part) continue;
      const far = Math.hypot(...channels(part.colors[0]).map((value, i) => value - (skin[i] ?? 0)));
      assert.ok(far >= 64, `${part.id} ${part.colors[0]} on skin ${avatar.face?.colors[0]}`);
    }
  }
});
