// A pose: where the head is at one moment, and the SVG transform that puts a group of shapes
// there. The drawing is flat; the head turns because what is on the face travels round it as a
// mark on a ball does.
import type { Group } from "./draw.ts";

export type Pose = {
  /** The head's shift, in drawing units, and its tilt, in degrees. */
  x: number;
  y: number;
  tilt: number;
  /** How tall the head stands: above 0 it stretches up and narrows, below it squashes down and
   * widens. A full breath is 1. */
  stretch: number;
  /** How far the head has turned, each from -1 to 1: to its right and down are above 0. */
  turnX: number;
  turnY: number;
  /** How far the eyes have turned beyond the head, each from -1 to 1. */
  gazeX: number;
  gazeY: number;
  /** The eyes, from 1 open to 0 closed. */
  open: number;
};

/** The head as it is drawn: every transform is empty. */
export const REST: Pose = {
  x: 0,
  y: 0,
  tilt: 0,
  stretch: 0,
  turnX: 0,
  turnY: 0,
  gazeX: 0,
  gazeY: 0,
  open: 1,
};

const DEGREES = Math.PI / 180;
/** The ball the face is on: its middle, and how far it reaches across and down. It is a little
 * inside the head's outline, so a mark at its edge is still on the face. */
const BALL = { x: 50, y: 56, rx: 36, ry: 34 } as const;
/** The furthest the head turns and the eyes turn beyond it, across and down, in radians. */
const HEAD = [28 * DEGREES, 20 * DEGREES] as const;
const EYES = [11 * DEGREES, 9 * DEGREES] as const;
/** The head tilts about its chin and stretches from it. */
const CHIN = [50, 88] as const;
/** How much a full breath stretches the head up, and narrows it. */
const BREATH = { tall: 0.022, wide: -0.012 } as const;
/** The least a turned mark narrows to, so it never thins to nothing at the edge. */
const THIN = 0.25;

/** A value to the nearest step, without the float's tail. */
const snap = (value: number, step: number) =>
  Math.round(Math.round(value / step) * step * 1e4) / 1e4;

/** Where a mark at `from` on the ball's width or height is once the ball has turned by `angle`,
 * and how much it has narrowed. */
function turned(from: number, middle: number, reach: number, angle: number) {
  const before = Math.asin(Math.max(-1, Math.min(1, (from - middle) / reach)));
  const after = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, before + angle));
  return {
    to: middle + reach * Math.sin(after),
    narrow: Math.max(THIN, Math.cos(after) / Math.cos(before)),
  };
}

/** The `transform` attribute for a group in a pose, empty when it has not moved. `step` is the
 * smallest movement worth making, in drawing units: a pose is drawn to the nearest step, so an
 * avatar a few pixels wide is given a new transform only when it would move on the screen. */
export function transformOf(group: Group, pose: Pose, step = 0.01): string {
  const parts: string[] = [];
  const [x, y] = [snap(pose.x, step), snap(pose.y, step)];
  if (x || y) parts.push(`translate(${x} ${y})`);
  const tilt = snap(pose.tilt, step / 60 / DEGREES);
  if (tilt) parts.push(`rotate(${tilt} ${CHIN[0]} ${CHIN[1]})`);
  const stretch = snap(pose.stretch, step / 1.5);
  if (stretch) {
    const [wide, tall] = [1 + BREATH.wide * stretch, 1 + BREATH.tall * stretch];
    parts.push(
      `translate(${snap(CHIN[0] * (1 - wide), 0.001)} ${snap(CHIN[1] * (1 - tall), 0.001)}) scale(${snap(wide, 1e-4)} ${snap(tall, 1e-4)})`,
    );
  }
  if (group.at) {
    const eyes = group.on === "eyes";
    const across = pose.turnX * HEAD[0] + (eyes ? pose.gazeX * EYES[0] : 0);
    const down = pose.turnY * HEAD[1] + (eyes ? pose.gazeY * EYES[1] : 0);
    const [ax, ay] = group.at;
    const h = turned(ax, BALL.x, BALL.rx, across);
    const v = turned(ay, BALL.y, BALL.ry, down);
    // Closed eyes keep a sliver, so they read as a line.
    const shut = eyes ? snap(Math.min(0.88, 1 - pose.open), 0.02) : 0;
    const scale = Math.min(0.02, step / 8);
    // What is rounded is how far it has moved and narrowed, so at rest it is exactly as drawn.
    const sx = snap(1 - snap(1 - h.narrow, scale), 1e-4);
    const sy = snap(1 - snap(1 - v.narrow * (1 - shut), scale), 1e-4);
    const [tx, ty] = [
      snap(ax + snap(h.to - ax, step), 1e-4),
      snap(ay + snap(v.to - ay, step), 1e-4),
    ];
    if (tx !== ax || ty !== ay || sx !== 1 || sy !== 1)
      parts.push(`translate(${tx} ${ty}) scale(${sx} ${sy}) translate(${-ax} ${-ay})`);
  }
  return parts.join(" ");
}
