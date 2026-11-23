// The demo page: an editor that changes an avatar's parts and shows its string, a sheet of that
// avatar turned each way, and avatars from seeds. With `?many=50` in the address it shows that
// many avatars and nothing else, for measuring what a full page costs.
import { createElement, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  avatarFromSeed,
  formatAvatar,
  mount,
  PARTS,
  parseAvatar,
  SLOTS,
  type Slot,
  type State,
  toSvg,
} from "../src/index.ts";
import { Avatar as ReactAvatar } from "../src/react.ts";

/** Seeds with names, and after them as many again that are only numbered. */
const SEEDS = [
  "release-notes",
  "inbox",
  "research",
  "billing",
  "onboarding",
  "night-watch",
  "translator",
  "bug-triage",
  "planner",
  "librarian",
  "support",
  "reviewer",
];
/** Avatars written out by hand. */
const DRESSED = [
  "v1.round-f7e3cf.dot-2a2530.sides-4a3128.specs-2a2530",
  "v1.round-e9c09c.dot-2a2530.sweep-2d2630.specs-2a2530",
  "v1.round-f7e3cf.dot-2a2530.waves-5b3a2c.specs-7a4a35",
  "v1.round-f7e3cf.dot-2a2530.mane-9d99a4",
  "v1.round-d2a078.dot-2a2530.specs-2a2530",
  "v1.round-ab7852.dot-2a2530.waves-2d2630",
];
const STATES: State[] = ["idle", "working", "asleep"];
const ACROSS = [-1, -0.66, -0.33, 0, 0.33, 0.66, 1];
const DOWN = [-1, 0, 1];

const at = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const make = <K extends keyof HTMLElementTagNameMap>(tag: K, props: object = {}) =>
  Object.assign(document.createElement(tag), props);

const many = Number(new URLSearchParams(location.search).get("many"));
if (many) {
  const grid = make("main", { className: "row many" });
  const value = new URLSearchParams(location.search).get("value");
  for (let i = 0; i < many; i++)
    mount(grid, value ? { value, size: 40 } : { seed: `agent-${i}`, size: 40 });
  document.querySelector("main")?.replaceWith(grid);
} else page();

function page() {
  at("theme").addEventListener("click", () => {
    const root = document.documentElement;
    const dark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
  });

  // The editor.
  let avatar = parseAvatar(DRESSED[0] as string);
  /** The slots the plain avatar fills, which have no "none". */
  const plain = parseAvatar("v1");
  const big = mount(at("big"), { value: formatAvatar(avatar), size: 260 });
  const small = [64, 40, 28, 20].map((size) => ({
    size,
    mounted: mount(at("small"), { value: formatAvatar(avatar), size }),
  }));
  // The sheet: the editor's avatar, still, turned each way.
  const sheet = DOWN.flatMap((y) => {
    const row = make("div", { className: "row" });
    at("turning").append(row);
    return ACROSS.map((x) => ({
      look: { x, y },
      mounted: mount(row, { value: formatAvatar(avatar), size: 84, look: { x, y }, still: true }),
    }));
  });
  const state = at<HTMLSelectElement>("state");
  const still = at<HTMLInputElement>("still");
  const follow = at<HTMLInputElement>("follow");
  const across = at<HTMLInputElement>("look-x");
  const down = at<HTMLInputElement>("look-y");
  const text = at<HTMLInputElement>("string");
  const problem = at("problem");

  const show = () => {
    const value = formatAvatar(avatar);
    across.disabled = down.disabled = follow.checked;
    const shown = {
      value,
      state: state.value as State,
      still: still.checked,
      look: follow.checked ? undefined : { x: Number(across.value), y: Number(down.value) },
    };
    big.update({ ...shown, size: 260 });
    for (const { size, mounted } of small) mounted.update({ ...shown, size });
    for (const { look, mounted } of sheet) mounted.update({ value, size: 84, look, still: true });
    if (document.activeElement !== text) text.value = value;
    problem.textContent = "";
  };

  const rows = new Map<Slot, () => void>();
  for (const slot of SLOTS) {
    const select = make("select", { id: `slot-${slot}` });
    if (!plain[slot]) select.append(make("option", { value: "", textContent: "none" }));
    for (const part of PARTS)
      if (part.slot === slot) select.append(make("option", { textContent: part.id }));
    const colors = make("span", { className: "row" });
    /** The row as the avatar has it. */
    const sync = () => {
      const choice = avatar[slot];
      select.value = choice?.id ?? "";
      colors.replaceChildren(
        ...(choice?.colors ?? []).map((color, i) => {
          const input = make("input", { type: "color", value: `#${color}` });
          input.setAttribute("aria-label", `${slot} colour ${i + 1}`);
          input.addEventListener("input", () => {
            choice?.colors.splice(i, 1, input.value.slice(1));
            show();
          });
          return input;
        }),
      );
    };
    select.addEventListener("change", () => {
      const part = PARTS.find((item) => item.id === select.value);
      // A part of the same kind keeps the colours chosen for the last one.
      const kept = avatar[slot]?.colors ?? [];
      if (part) avatar[slot] = { id: part.id, colors: part.colors.map((c, i) => kept[i] ?? c) };
      else delete avatar[slot];
      sync();
      show();
    });
    rows.set(slot, sync);
    const field = make("div", { className: "field" });
    field.append(make("label", { htmlFor: select.id, textContent: slot }), select, colors);
    at("slots").append(field);
  }
  const load = (value: string) => {
    avatar = parseAvatar(value);
    for (const sync of rows.values()) sync();
    show();
  };

  text.addEventListener("input", () => {
    try {
      load(text.value.trim());
    } catch (error) {
      problem.textContent = error instanceof Error ? error.message : String(error);
    }
  });
  text.addEventListener("blur", show);
  for (const control of [state, still, follow]) control.addEventListener("change", show);
  for (const control of [across, down]) control.addEventListener("input", show);
  const seed = at<HTMLInputElement>("seed");
  seed.addEventListener("input", () => load(avatarFromSeed(seed.value)));
  at("random").addEventListener("click", () => {
    seed.value = Math.random().toString(36).slice(2, 8);
    load(avatarFromSeed(seed.value));
  });
  load(formatAvatar(avatar));

  /** A live avatar that opens in the editor. */
  const opener = (into: HTMLElement, value: string, name: string) => {
    const button = make("button", { type: "button", title: name });
    button.setAttribute("aria-label", `Edit ${name}`);
    mount(button, { value, size: 72 });
    button.addEventListener("click", () => {
      load(value);
      at("big").scrollIntoView({ behavior: "smooth", block: "center" });
    });
    into.append(button);
  };
  for (const value of DRESSED) opener(at("dressed"), value, value);
  for (const name of [...SEEDS, ...Array.from({ length: 36 }, (_, i) => `agent-${i}`)])
    opener(at("seeded"), avatarFromSeed(name), name);

  for (const size of [20, 28, 40, 64])
    for (const value of DRESSED) mount(at("sizes"), { value, size });

  for (const name of STATES)
    mount(at("states"), { value: DRESSED[2] as string, size: 96, state: name });

  for (const value of DRESSED) {
    at("images").append(
      make("img", {
        width: 56,
        height: 56,
        alt: "",
        src: `data:image/svg+xml,${encodeURIComponent(toSvg(value))}`,
      }),
    );
  }

  createRoot(at("react")).render(createElement(Team));
}

/** The React component: a few avatars whose state a button changes. */
function Team() {
  const [turn, setTurn] = useState(0);
  const state = STATES[turn % STATES.length];
  return createElement(
    "div",
    { className: "row" },
    SEEDS.slice(6, 12).map((seed) =>
      createElement(ReactAvatar, { key: seed, seed, size: 64, state, label: seed }),
    ),
    createElement("button", { type: "button", onClick: () => setTurn(turn + 1) }, state),
  );
}
