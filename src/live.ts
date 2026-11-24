// A live avatar in a page: an SVG element built from the avatar's string, moved by one clock all
// the page's avatars share. It is made with DOM calls and moved through SVG attributes, so it
// works under a content policy that allows neither inline styles nor code from text.
import { type Drawing, type Drawn, draw } from "./draw.ts";
import { hash } from "./hash.ts";
import { type Aim, aimAt, createMotion, type Motion, type State, settled } from "./motion.ts";
import { pathText } from "./path.ts";
import { headTransform, mover, REST, turnOf } from "./pose.ts";
import { avatarFromSeed } from "./seed.ts";
import { type Avatar, parseAvatar } from "./string.ts";

export type Options = {
  /** The avatar's string. Text that is not one draws the plain avatar. */
  value?: string;
  /** What to make the avatar from when there is no string, such as an agent's id. */
  seed?: string;
  /** Its width and height in CSS pixels. Without one it fills the element it is in. */
  size?: number;
  /** Stand still: as drawn, or turned the way `look` says. */
  still?: boolean;
  /** Where it looks, from its middle: each from -1 to 1, right and down. Without one it moves
   * by itself, and follows the pointer while the pointer moves near it. */
  look?: Aim;
  /** What the avatar is doing. */
  state?: State;
  /** What a screen reader calls it. Without one it is hidden from screen readers. */
  label?: string;
};

export type Mounted = {
  /** Draw from these options instead. */
  update(options: Options): void;
  /** Take the avatar out of the page and off the clock. */
  remove(): void;
};

type Live = {
  svg: SVGSVGElement;
  /** The group that holds every shape and carries the head's shift, tilt and breath. */
  head: SVGGElement;
  transform: string;
  /** The shapes that have something on the face, each with the turn it was last drawn at. */
  turning: { element: SVGPathElement; drawn: Drawn; key: string }[];
  /** The smallest movement worth making, in drawing units: a quarter of a screen pixel. */
  step: number;
  motion: Motion;
  state: State;
  look?: Aim;
  still: boolean;
  seen: boolean;
  /** Its middle and width on the screen, measured at most every `MEASURE` milliseconds. */
  box?: { x: number; y: number; width: number; at: number };
};

const SVG = "http://www.w3.org/2000/svg";
/** Eyes follow the pointer while it moves near and for this long after, in milliseconds. */
const FOLLOW = 2500;
const MEASURE = 300;
/** The least time between two moves, in milliseconds: 30 moves a second on any screen. */
const BEAT = 1000 / 30 - 4;

const all = new Set<Live>();
const moving = new Set<Live>();
let frame = 0;
let last = 0;
let pointer: { x: number; y: number; at: number } | undefined;
let reduced: MediaQueryList | undefined;
let watcher: IntersectionObserver | undefined;
const watched = new WeakMap<Element, Live>();

/** An avatar moves while it is not still, on screen, and the person has not asked for reduced
 * motion. Otherwise it is off the clock, and still ones rest as drawn, or turned the way they
 * are told to look. */
function settle(live: Live) {
  const moves = !live.still && live.seen && !reduced?.matches;
  if (moves) {
    moving.add(live);
    if (!frame) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }
  } else {
    moving.delete(live);
    if (live.still || reduced?.matches) pose(live, live.look ? settled(live.look) : REST);
  }
}

/** A turn that has not turned, which is how every shape is first drawn. */
const AHEAD = turnOf(REST, true).key;

function pose(live: Live, at: typeof REST) {
  const transform = headTransform(at, live.step);
  if (transform !== live.transform) {
    live.transform = transform;
    if (transform) live.head.setAttribute("transform", transform);
    else live.head.removeAttribute("transform");
  }
  const [face, eyes] = [turnOf(at, false, live.step), turnOf(at, true, live.step)];
  for (const item of live.turning) {
    const turn = item.drawn.eye ? eyes : face;
    if (turn.key === item.key) continue;
    item.key = turn.key;
    item.element.setAttribute("d", pathText(item.drawn.segments, mover(turn, item.drawn.eye)));
  }
}

/** Where the avatar looks at the pointer, or nothing while the pointer is still or far off. */
function aimOf(live: Live, now: number): Aim | undefined {
  if (live.look) return live.look;
  if (!pointer || now - pointer.at > FOLLOW) return undefined;
  if (!live.box || now - live.box.at > MEASURE) {
    const rect = live.svg.getBoundingClientRect();
    live.box = {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2,
      width: rect.width,
      at: now,
    };
  }
  const { x, y, width } = live.box;
  if (!width) return undefined;
  return aimAt((pointer.x - x) / width, (pointer.y - y) / width);
}

function tick(now: number) {
  frame = requestAnimationFrame(tick);
  if (now - last < BEAT) return;
  const seconds = (now - last) / 1000;
  last = now;
  // Every avatar is measured before any is moved, so the page is laid out once.
  const aims = [...moving].map((live) => aimOf(live, now));
  let i = 0;
  for (const live of moving) pose(live, live.motion.step(seconds, live.state, aims[i++]));
  if (!moving.size) {
    cancelAnimationFrame(frame);
    frame = 0;
  }
}

/** The page's listeners, added when its first avatar is mounted. */
function listen() {
  if (reduced) return;
  reduced = matchMedia("(prefers-reduced-motion: reduce)");
  reduced.addEventListener("change", () => all.forEach(settle));
  watcher = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const live = watched.get(entry.target);
      if (!live) continue;
      live.seen = entry.isIntersecting;
      settle(live);
    }
  });
  addEventListener(
    "pointermove",
    (event) => {
      pointer = { x: event.clientX, y: event.clientY, at: performance.now() };
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", () => {
    pointer = undefined;
  });
}

const read = (options: Options): Avatar => {
  try {
    return parseAvatar(options.value ?? avatarFromSeed(options.seed ?? ""));
  } catch {
    return parseAvatar("v1");
  }
};

function build(live: Live, drawing: Drawing) {
  live.svg.setAttribute("viewBox", drawing.viewBox);
  live.turning = [];
  live.head.replaceChildren(
    ...drawing.shapes.map((drawn) => {
      const element = document.createElementNS(SVG, "path");
      element.setAttribute("d", pathText(drawn.segments));
      for (const [name, value] of Object.entries(drawn.paint)) element.setAttribute(name, value);
      if (drawn.turns) live.turning.push({ element, drawn, key: AHEAD });
      return element;
    }),
  );
}

/** Put a live avatar in an element. It starts moving at once, and stops by itself while it is
 * off screen and for a person who asks for reduced motion. */
export function mount(target: Element, options: Options): Mounted {
  listen();
  const svg = document.createElementNS(SVG, "svg");
  svg.style.display = "block";
  const head = svg.appendChild(document.createElementNS(SVG, "g"));
  const live: Live = {
    svg,
    head,
    transform: "",
    turning: [],
    step: 0.01,
    motion: createMotion(hash(options.value ?? options.seed ?? "")),
    state: "idle",
    still: false,
    seen: false,
  };
  let drawn = "";
  const apply = (next: Options) => {
    const size = next.size ? String(next.size) : "100%";
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
    if (next.label) {
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", next.label);
      svg.removeAttribute("aria-hidden");
    } else {
      svg.setAttribute("aria-hidden", "true");
      svg.removeAttribute("role");
      svg.removeAttribute("aria-label");
    }
    const key = JSON.stringify([next.value, next.seed]);
    if (key !== drawn) {
      drawn = key;
      build(live, draw(read(next)));
    }
    // Without a size the avatar is as wide as its element, which is measured once it is in the
    // page.
    const width = next.size ?? svg.getBoundingClientRect().width;
    const units = Number(svg.getAttribute("viewBox")?.split(" ")[2]);
    live.step = width ? Math.max(0.01, units / (4 * width * devicePixelRatio)) : 0.01;
    live.state = next.state ?? "idle";
    live.look = next.look;
    live.still = next.still ?? false;
    live.box = undefined;
    settle(live);
  };
  target.append(svg);
  apply(options);
  all.add(live);
  watched.set(svg, live);
  watcher?.observe(svg);
  return {
    update: apply,
    remove() {
      watcher?.unobserve(svg);
      all.delete(live);
      moving.delete(live);
      svg.remove();
    },
  };
}
