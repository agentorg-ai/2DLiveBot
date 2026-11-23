import assert from "node:assert/strict";
import test from "node:test";
import { createMotion, type State, settled } from "../src/motion.ts";
import { headTransform, mover, type Pose, REST, turnOf } from "../src/pose.ts";

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

/** Where a point on the face is in a pose. */
const placed = (pose: Pose, x: number, y: number) => mover(turnOf(pose, false))(x, y);

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

test("at rest nothing has moved, at any size", () => {
  for (const step of [0.01, 0.03, 0.11, 0.28, 0.43]) {
    assert.equal(headTransform(REST, step), "");
    assert.equal(turnOf(REST, true, step).key, turnOf(REST, true).key);
    for (const [x, y] of [
      [33.5, 60],
      [50, 30],
      [8, 70],
      [97, 20],
    ] as const)
      assert.deepEqual(mover(turnOf(REST, false, step))(x, y), [x, y]);
  }
});

test("as the head turns, what lies on the face travels round it and narrows toward the edge", () => {
  const turned = settled({ x: 1, y: 0 });
  // Two marks, each as wide as an eye, at the eyes' places.
  const width = (x: number) =>
    (placed(turned, x + 3.4, 60)[0] ?? 0) - (placed(turned, x - 3.4, 60)[0] ?? 0);
  const [near, far] = [placed(turned, 33.5, 60), placed(turned, 66.5, 60)];
  // Both go the way the head turns, and stay level with each other.
  assert.ok(near[0] > 33.5 + 8 && far[0] > 66.5 + 8);
  assert.ok(Math.abs(near[1] - far[1]) < 0.01);
  // The one ahead has less room left: it moves less and is drawn narrower.
  assert.ok(far[0] - 66.5 < near[0] - 33.5);
  assert.ok(width(66.5) < width(33.5) && width(66.5) < 6.8 * 0.9);
  // It is still on the face, whose outline reaches 88 there.
  assert.ok(far[0] + width(66.5) / 2 < 88);
  // The other way is the mirror of it.
  const other = placed(settled({ x: -1, y: 0 }), 33.5, 60);
  assert.ok(Math.abs(other[0] - (100 - far[0])) < 0.01 && Math.abs(other[1] - far[1]) < 0.01);
});

test("a hairline goes with the face while the hair's rim stays: the lock ahead thins, the other widens", () => {
  // Two locks of hair at eye level: their rims at 9 and 91, their hairlines at 19 and 81.
  const turned = settled({ x: 1, y: 0 });
  const [left, right] = [placed(turned, 19, 56.5)[0], placed(turned, 81, 56.5)[0]];
  assert.ok(left - 9 > (19 - 9) * 1.5, "the lock we turn away from widens");
  assert.ok(91 - right < (91 - 81) * 0.5 && right < 91, "the lock ahead thins, inside its rim");
});

test("nothing on the face crosses the head's edge, and what is at the edge stays", () => {
  const inside = (x: number, y: number) => Math.hypot((x - 50) / 38, (y - 55.5) / 33);
  for (const look of [
    { x: 1, y: 0 },
    { x: -1, y: 1 },
    { x: 1, y: -1 },
  ]) {
    // The furthest the face ever turns: all the way, and the little past it a spring goes.
    const move = mover(turnOf({ ...REST, turnX: look.x * 1.1, turnY: look.y * 1.1 }, false));
    for (let x = 12; x <= 88; x += 4)
      for (let y = 23; y <= 88; y += 5) {
        if (inside(x, y) >= 1) assert.deepEqual(move(x, y), [x, y]);
        else assert.ok(inside(...move(x, y)) <= 1 + 1e-9, `${x} ${y} looking ${look.x} ${look.y}`);
      }
  }
});

test("looking down, what lies on the face drops; the head itself only shifts and leans", () => {
  const down = settled({ x: 0, y: 1 });
  assert.ok(placed(down, 33.5, 60)[1] > 60 + 6);
  assert.equal(placed(down, 33.5, 60)[0], 100 - placed(down, 66.5, 60)[0]);
  assert.equal(headTransform(down), "translate(0 1.12)");
  assert.match(
    headTransform(settled({ x: 1, y: 0 })),
    /^translate\(1\.76 0\) rotate\(2\.\d+ 50 88\)$/,
  );
});

test("the eyes turn further than the face, and a blink closes each onto its own middle", () => {
  const pose = settled({ x: 1, y: 0 });
  const [face, eyes] = [turnOf(pose, false), turnOf(pose, true)];
  assert.ok(eyes.across > face.across && face.shut === 0);
  const shut = mover(turnOf({ ...REST, open: 0 }, true), [33.5, 60]);
  // The eye's top and bottom, 4.2 from its middle, close to a sliver about that middle.
  assert.deepEqual(shut(33.5, 60), [33.5, 60]);
  const [top, bottom] = [shut(33.5, 55.8)[1], shut(33.5, 64.2)[1]];
  assert.ok(Math.abs(60 - top - (bottom - 60)) < 1e-9 && bottom - top < 1.2 && bottom - top > 0.5);
});

test("a pose is drawn to the nearest step, so a small avatar changes only when it would show", () => {
  assert.equal(headTransform({ ...REST, x: 0.2 }, 0.5), "");
  assert.equal(headTransform({ ...REST, x: 0.3 }, 0.5), "translate(0.5 0)");
  const still = turnOf(REST, false, 0.5).key;
  assert.equal(turnOf({ ...REST, turnX: 0.01 }, false, 0.5).key, still);
  assert.notEqual(turnOf({ ...REST, turnX: 0.05 }, false, 0.5).key, still);
});
