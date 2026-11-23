import assert from "node:assert/strict";
import test from "node:test";
import { draw, type Group } from "../src/draw.ts";
import { createMotion, type State, settled } from "../src/motion.ts";
import { type Pose, REST, transformOf } from "../src/pose.ts";
import { parseAvatar } from "../src/string.ts";

const FRAME = 1 / 30;
/** Every pose of a run, as copies. */
const run = (
  seed: number,
  seconds: number,
  state: State = "idle",
  aim?: { x: number; y: number },
) => {
  const motion = createMotion(seed);
  const poses: Pose[] = [];
  for (let t = 0; t < seconds; t += FRAME) poses.push({ ...motion.step(FRAME, state, aim) });
  return poses;
};

const { groups } = draw(parseAvatar("v1"));
const [head, left, right] = groups as [Group, Group, Group];
/** Where a group's place is in a pose, and how wide and tall it is drawn there, read from its
 * transform's last part: `translate(x y) scale(sx sy) translate(...)`. */
const placed = (group: Group, pose: Pose) => {
  const match = /translate\((\S+) (\S+)\) scale\((\S+) (\S+)\) translate\(\S+ \S+\)$/.exec(
    transformOf(group, pose),
  );
  const [x, y, wide, tall] = (match?.slice(1) ?? [...(group.at ?? []), 1, 1]).map(Number);
  return { x, y, wide, tall } as { x: number; y: number; wide: number; tall: number };
};

test("the same seed moves the same way, and another seed keeps its own time", () => {
  assert.deepEqual(run(7, 10), run(7, 10));
  assert.notDeepEqual(run(7, 10), run(8, 10));
});

test("an idle avatar blinks, breathes and looks about, within what the head allows", () => {
  const poses = run(3, 30);
  const blinks = poses.filter((pose, i) => pose.open < 0.2 && (poses[i - 1]?.open ?? 1) >= 0.2);
  assert.ok(blinks.length >= 3 && blinks.length <= 20, `${blinks.length} blinks in 30 seconds`);
  // Its eyes are open nearly all the time.
  assert.ok(poses.filter((pose) => pose.open === 1).length > poses.length * 0.8);
  assert.ok(Math.max(...poses.map((pose) => pose.stretch)) > 0.9);
  assert.ok(Math.min(...poses.map((pose) => pose.stretch)) < -0.9);
  assert.ok(
    poses.some((pose) => Math.abs(pose.turnX) > 0.2),
    "it looks away now and then",
  );
  for (const pose of poses) {
    assert.ok(Math.abs(pose.turnX) <= 1.1 && Math.abs(pose.turnY) <= 1.1);
    assert.ok(Math.abs(pose.gazeX) <= 1 && Math.abs(pose.gazeY) <= 1);
    assert.ok(Math.abs(pose.tilt) < 12 && Math.abs(pose.stretch) < 2.5);
  }
});

test("an avatar looks where it is aimed: eyes first, then the head, a little past and back", () => {
  const poses = run(5, 3, "idle", { x: 1, y: 0 });
  const early = poses[2];
  const late = poses.at(-1);
  assert.ok(early && late);
  assert.ok(early.gazeX > early.turnX, "the eyes lead");
  assert.ok(Math.max(...poses.map((pose) => pose.turnX)) > late.turnX, "the head overshoots");
  assert.ok(Math.abs(late.turnX - settled({ x: 1, y: 0 }).turnX) < 0.12, "and settles");
});

test("asleep, the eyes close and stay closed; awake again, they open", () => {
  const motion = createMotion(9);
  let pose = REST;
  for (let i = 0; i < 90; i++) pose = motion.step(FRAME, "asleep");
  assert.ok(pose.open < 0.05);
  for (let i = 0; i < 300; i++) assert.ok(motion.step(FRAME, "asleep", { x: 1, y: 0 }).open < 0.05);
  for (let i = 0; i < 30; i++) pose = motion.step(FRAME, "idle");
  assert.ok(pose.open > 0.9);
});

test("working, the eyes are on what is below", () => {
  const poses = run(11, 6, "working").slice(60);
  assert.ok(poses.every((pose) => pose.turnY > 0.2));
});

test("a long gap moves the avatar no further than a slow frame does", () => {
  const [a, b] = [createMotion(4), createMotion(4)];
  assert.deepEqual({ ...a.step(60, "idle") }, { ...b.step(0.05, "idle") });
});

test("at rest nothing has a transform, at any size", () => {
  for (const group of groups)
    for (const step of [0.01, 0.03, 0.11, 0.28, 0.43])
      assert.equal(transformOf(group, REST, step), "");
});

test("as the head turns, the eyes travel round it: the one ahead nears the edge and narrows", () => {
  const ahead = placed(right, REST);
  const turned = settled({ x: 1, y: 0 });
  const [near, far] = [placed(left, turned), placed(right, turned)];
  // Both go the way the head turns, and stay level.
  assert.ok(near.x > 33.5 + 8 && far.x > ahead.x + 8);
  assert.ok(Math.abs(near.y - far.y) < 0.01);
  // The far eye has less room left, so it moves less and is drawn narrower; neither is taller.
  assert.ok(far.x - ahead.x < near.x - 33.5);
  assert.ok(far.wide < 0.7 && far.wide < near.wide && near.wide > 0.95);
  // It is still on the face: inside the head's outline, which reaches 88 there.
  assert.ok(far.x + 3.4 * far.wide < 86);
  // The other way is the mirror of it.
  const other = settled({ x: -1, y: 0 });
  assert.ok(Math.abs(placed(left, other).x - (100 - far.x)) < 0.02);
  assert.ok(Math.abs(placed(left, other).wide - far.wide) < 0.02);
});

test("looking down, the eyes drop and flatten; the head's outline only shifts and leans", () => {
  const down = settled({ x: 0, y: 1 });
  const eye = placed(left, down);
  assert.ok(eye.y > 60 + 6 && eye.tall < 0.95 && eye.wide === 1);
  assert.equal(transformOf(head, down), "translate(0 1.12)");
  assert.match(
    transformOf(head, settled({ x: 1, y: 0 })),
    /^translate\(1\.76 0\) rotate\(2\.\d+ 50 88\)$/,
  );
});

test("a blink closes each eye onto its own place, and a pose is drawn to the nearest step", () => {
  assert.equal(
    transformOf(left, { ...REST, open: 0.5 }),
    "translate(33.5 60) scale(1 0.5) translate(-33.5 -60)",
  );
  // An avatar whose pixel is half a unit doesn't move for a fifth of one.
  assert.equal(transformOf(head, { ...REST, x: 0.2 }, 0.5), "");
  assert.equal(transformOf(head, { ...REST, x: 0.3 }, 0.5), "translate(0.5 0)");
});
