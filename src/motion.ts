// How an avatar moves by itself: it breathes, blinks, glances about, and turns its head after
// its eyes with a little spring. No clock and no page here: the caller says how much time has
// passed.
import { random } from "./hash.ts";
import type { Pose } from "./pose.ts";

/** What the avatar is doing: nothing in particular; reading something below it; or asleep, its
 * eyes closed and its breath slow. */
export type State = "idle" | "working" | "asleep";

/** Where something to look at is, from the avatar's middle: each from -1 to 1, right and down. */
export type Aim = { x: number; y: number };

export type Motion = {
  /** The pose after `seconds` more. With an aim, an avatar that is awake looks there. */
  step(seconds: number, state: State, aim?: Aim): Pose;
};

/** A value moved toward a target, covering most of the way in `1 / rate` seconds. */
const ease = (value: number, target: number, rate: number, seconds: number) =>
  value + (target - value) * (1 - Math.exp(-rate * seconds));

/** A value on a spring: it runs to its target, a little past it, and settles. */
type Sprung = { value: number; speed: number };
const spring = (sprung: Sprung, target: number, stiff: number, damp: number, seconds: number) => {
  sprung.speed += (stiff * (target - sprung.value) - damp * sprung.speed) * seconds;
  sprung.value += sprung.speed * seconds;
  return sprung.value;
};

/** A blink, in seconds: the lids close in the first part of it and open in the rest. */
const BLINK = { length: 0.2, closed: 0.4 } as const;
/** A line of reading, in seconds, and the stops the eyes make along it. */
const LINE = { length: 2.6, stops: 6 } as const;
/** How much of the way to what it looks at the head turns; the eyes go the rest. */
const FOLLOW = 0.8;
/** How far the head shifts, in drawing units, and tilts, in degrees, when it has turned all the
 * way. */
const LEAN = { x: 2.2, y: 1.4, tilt: 3 } as const;

const within = (value: number) => Math.max(-1, Math.min(1, value));

/** The pose an avatar comes to rest in when it looks one way: the head turned most of the way,
 * leaning with the turn, and the eyes the rest. */
export function settled(look: Aim): Pose {
  const [turnX, turnY] = [look.x * FOLLOW, look.y * FOLLOW];
  return {
    x: turnX * LEAN.x,
    y: turnY * LEAN.y,
    tilt: turnX * LEAN.tilt,
    stretch: 0,
    turnX,
    turnY,
    gazeX: within((look.x - turnX) * 2),
    gazeY: within((look.y - turnY) * 2),
    open: 1,
  };
}

/** An avatar's motion. The seed decides its rhythm, so avatars side by side keep their own
 * time. */
export function createMotion(seed: number): Motion {
  const next = random(seed);
  const period = 3.4 + next() * 1.4;
  const offset = next() * 100;
  let time = offset;
  let breathing = next() * Math.PI * 2;
  let blinkAt = time + 0.5 + next() * 3.5;
  let blinking = -1;
  let glanceAt = time + 1 + next() * 3;
  let glance: Aim = { x: 0, y: 0 };
  /** A tilt of the head to one side, taken up with a glance now and then. */
  let cock = 0;
  const turnX: Sprung = { value: 0, speed: 0 };
  const turnY: Sprung = { value: 0, speed: 0 };
  const tilt: Sprung = { value: 0, speed: 0 };
  /** A dip and rebound of the whole head, set off when it starts to turn. */
  const bounce: Sprung = { value: 0, speed: 0 };
  const pose: Pose = {
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

  return {
    step(seconds, state, aim) {
      // A long gap, as after a hidden tab, moves the avatar no further than one slow frame.
      const dt = Math.min(Math.max(seconds, 0), 0.05);
      time += dt;
      const asleep = state === "asleep";

      breathing += (dt * Math.PI * 2) / (asleep ? period * 1.7 : period);
      const breath = Math.sin(breathing) * (asleep ? 1.4 : 1);

      // Where to look.
      let look: Aim;
      if (asleep) look = { x: 0.15, y: 0.8 };
      else if (aim) {
        look = aim;
        glance = { x: 0, y: 0 };
        cock = 0;
        glanceAt = time + 0.6 + next() * 1.5;
      } else if (state === "working") {
        const stop = Math.floor(((time / LINE.length) % 1) * LINE.stops) / (LINE.stops - 1);
        look = { x: -0.45 + stop * 0.9, y: 0.7 };
      } else {
        if (time >= glanceAt) {
          // Mostly ahead, now and then away, and sometimes with the head cocked.
          const away = next() < 0.5;
          glance = away ? { x: next() * 1.8 - 0.9, y: next() * 1.1 - 0.45 } : { x: 0, y: 0 };
          cock = away && next() < 0.35 ? (next() < 0.5 ? -5 : 5) : 0;
          glanceAt = time + (away ? 0.9 + next() * 1.8 : 2 + next() * 4);
          bounce.speed -= 2.2;
        }
        look = glance;
      }

      // The eyes go first; the head springs after them most of the way, with a slow drift of
      // its own.
      const drift = Math.sin(time * 0.31 + offset) * 0.07 + Math.sin(time * 0.83 + offset) * 0.03;
      pose.turnX = spring(turnX, look.x * FOLLOW + drift, 70, 10.5, dt);
      pose.turnY = spring(turnY, look.y * FOLLOW, 70, 10.5, dt);
      pose.gazeX = ease(pose.gazeX, within((look.x - pose.turnX) * 2), 16, dt);
      pose.gazeY = ease(pose.gazeY, within((look.y - pose.turnY) * 2), 16, dt);

      // The head leans the way it turns, and rises and falls with the breath.
      const nod = state === "working" ? Math.sin(time * 6.5) * 0.2 : 0;
      pose.x = pose.turnX * LEAN.x;
      pose.y = pose.turnY * LEAN.y - breath * 0.4 + nod;
      const lean =
        pose.turnX * LEAN.tilt + Math.sin(time * 0.4 + offset) * 0.8 + cock + (asleep ? 5 : 0);
      pose.tilt = spring(tilt, lean, 45, 9, dt);
      pose.stretch = breath + spring(bounce, 0, 120, 9, dt);

      // The eyes.
      if (asleep) {
        blinking = -1;
        pose.open = ease(pose.open, 0, 5, dt);
      } else if (blinking < 0 && time >= blinkAt) blinking = 0;
      if (blinking >= 0) {
        blinking += dt;
        const done = blinking / BLINK.length;
        if (done >= 1) {
          blinking = -1;
          // Now and then two blinks together.
          blinkAt = time + (next() < 0.15 ? 0.12 : 1.8 + next() * 4.2);
          pose.open = 1;
        } else
          pose.open =
            done < BLINK.closed
              ? 1 - done / BLINK.closed
              : (done - BLINK.closed) / (1 - BLINK.closed);
      } else if (!asleep) pose.open = ease(pose.open, 1, 14, dt);
      return pose;
    },
  };
}
