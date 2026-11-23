// The demo page: avatars from seeds and strings, and an editor that changes an avatar's parts and
// shows its string. With `?many=50` in the address it shows that many avatars and nothing else,
// for measuring what a full page costs.
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
const STATES: State[] = ["idle", "working", "asleep"];

const at = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const make = <K extends keyof HTMLElementTagNameMap>(tag: K, props: object = {}) =>
  Object.assign(document.createElement(tag), props);

const many = Number(new URLSearchParams(location.search).get("many"));
if (many) {
  const grid = make("main", { className: "row many" });
  for (let i = 0; i < many; i++) mount(grid, { seed: `agent-${i}`, size: 40 });
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
  let avatar = parseAvatar("v1");
  /** The slots the plain avatar fills, which have no "none". */
  const plain = parseAvatar("v1");
  const big = mount(at("big"), { value: formatAvatar(avatar), size: 260 });
  const small = [64, 40, 28, 20].map((size) => ({
    size,
    mounted: mount(at("small"), { value: formatAvatar(avatar), size }),
  }));
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

  // Turning: a face for each way of looking, from left to right and from up to down.
  for (const y of [-1, 0, 1]) {
    const row = make("div", { className: "row" });
    for (const x of [-1, -0.66, -0.33, 0, 0.33, 0.66, 1])
      mount(row, { value: "v1", size: 84, look: { x, y }, still: true });
    at("turning").append(row);
  }

  // The face shapes, side by side.
  for (const part of PARTS)
    if (part.slot === "face") {
      const figure = make("figure");
      mount(figure, { value: `v1.${part.id}`, size: 110 });
      figure.append(make("figcaption", { textContent: part.id }));
      at("shapes").append(figure);
    }

  // From seeds. Each opens in the editor.
  for (const name of SEEDS) {
    const button = make("button", { type: "button", title: name });
    button.setAttribute("aria-label", `Edit the avatar of ${name}`);
    mount(button, { seed: name, size: 72 });
    button.addEventListener("click", () => {
      seed.value = name;
      load(avatarFromSeed(name));
      at("big").scrollIntoView({ behavior: "smooth", block: "center" });
    });
    at("seeded").append(button);
  }

  for (const size of [20, 28, 40, 64])
    for (const name of SEEDS.slice(0, 6)) mount(at("sizes"), { seed: name, size });

  for (const name of STATES) mount(at("states"), { seed: "planner", size: 96, state: name });

  for (const name of SEEDS.slice(0, 6)) {
    const svg = toSvg(avatarFromSeed(name));
    at("images").append(
      make("img", {
        width: 56,
        height: 56,
        alt: name,
        src: `data:image/svg+xml,${encodeURIComponent(svg)}`,
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
