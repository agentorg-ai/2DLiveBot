// A pose: where the head is at one moment, the SVG transform that puts the whole head there,
// and where the head's turn takes a point on the face. The drawing is flat; the head turns
// because what lies on the face travels round it as a mark on a ball does.
import type { Point } from "./part.ts";

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

/** The head as it is drawn: nothing has moved. */
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
/** The ball the face is the front of: its middle, and how far it reaches across and down. It
 * is wider than the head, whose face is the ball's shallow front, so that what lies near the
 * head's edge still has room to travel and a hairline keeps a smooth line as it goes. */
const BALL = { x: 50, y: 55.5, rx: 45, ry: 40 } as const;
/** The furthest the head turns and the eyes turn beyond it, across and down, in radians. */
const HEAD = [22 * DEGREES, 16 * DEGREES] as const;
const EYES = [9 * DEGREES, 7 * DEGREES] as const;
/** The head tilts about its chin and stretches from it. */
const CHIN = [50, 88] as const;
/** How much a full breath stretches the head up, and narrows it. */
const BREATH = { tall: 0.022, wide: -0.012 } as const;
/** Closed eyes keep this much of their height, so they read as a line. */
const SLIVER = 0.12;

/** A value to the nearest step, without the float's tail. */
const snap = (value: number, step: number) =>
  Math.round(Math.round(value / step) * step * 1e4) / 1e4;

/** The `transform` attribute that puts the whole head in a pose, empty when it has not moved.
 * `step` is the smallest movement worth making, in drawing units: a pose is drawn to the
 * nearest step, so an avatar a few pixels wide changes only when it would move on the screen. */
export function headTransform(pose: Pose, step = 0.01): string {
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
  return parts.join(" ");
}

/** How far the ball has turned, across and down in radians, and how far an eye on it has shut,
 * from 0 to 1. `key` is the same for two turns that draw alike. */
export type Turn = { across: number; down: number; shut: number; key: string };

/** The turn of the face in a pose, or of the eyes, which turn a little further by themselves
 * and can shut. It is drawn to the nearest step, as `headTransform` is. */
export function turnOf(pose: Pose, eyes: boolean, step = 0.01): Turn {
  const least = step / BALL.rx;
  const across = snap(pose.turnX * HEAD[0] + (eyes ? pose.gazeX * EYES[0] : 0), least);
  const down = snap(pose.turnY * HEAD[1] + (eyes ? pose.gazeY * EYES[1] : 0), least);
  const shut = eyes ? snap(1 - pose.open, Math.min(0.05, step / 4)) : 0;
  return { across, down, shut, key: `${across} ${down} ${shut}` };
}

/** What moves the points of a shape on the face for a turn: a point goes where a mark there on
 * the ball goes as the ball turns, and a point of an eye then closes onto the eye's middle. */
export function mover(
  turn: Turn,
  eye?: Point,
): (x: number, y: number) => readonly [number, number] {
  const [sinA, cosA] = [Math.sin(turn.across), Math.cos(turn.across)];
  const [sinD, cosD] = [Math.sin(turn.down), Math.cos(turn.down)];
  const onBall = (x: number, y: number): readonly [number, number] => {
    let [u, v] = [(x - BALL.x) / BALL.rx, (y - BALL.y) / BALL.ry];
    // A point off the ball is carried by the nearest point of its edge.
    const far = Math.max(1, Math.hypot(u, v));
    [u, v] = [u / far, v / far];
    const [offX, offY] = [x - (BALL.x + BALL.rx * u), y - (BALL.y + BALL.ry * v)];
    const w = Math.sqrt(Math.max(0, 1 - u * u - v * v));
    // Turned across, then down.
    let across = u * cosA + w * sinA;
    const depth = w * cosA - u * sinA;
    let down = v * cosD + depth * sinD;
    // A point turned out of sight stays at the edge it went round.
    if (depth * cosD - v * sinD < 0) {
      const reach = Math.hypot(across, down) || 1;
      [across, down] = [across / reach, down / reach];
    }
    return [BALL.x + BALL.rx * across + offX, BALL.y + BALL.ry * down + offY];
  };
  if (!eye) return onBall;
  const middle = onBall(eye[0], eye[1])[1];
  const open = 1 - turn.shut * (1 - SLIVER);
  return (x, y) => {
    const [tx, ty] = onBall(x, y);
    return [tx, middle + (ty - middle) * open];
  };
}
