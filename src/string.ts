// An avatar's string: every setting of an avatar in one line of text, as
//
//   v1.round-f7e3cf.dot-2a2530
//
// `v1` is the format. Each part follows a dot: its id, then each of its colours after a hyphen,
// as six lowercase hex digits. The text uses only lowercase letters, digits, dots and hyphens, so
// it goes into a URL, a JSON value or a file name as it is.
//
// A string keeps drawing the same avatar: a part's id and drawing are permanent, and its colours
// are in the string. A part the catalog doesn't have is passed over and a colour beyond those a
// part takes is ignored, so a string made with a later catalog still draws here. The format's
// number changes only when this grammar does.
import { type Part, SLOTS, type Slot } from "./part.ts";
import { BASE, partOf } from "./parts/index.ts";

/** A part in an avatar, with every colour it takes. */
export type Choice = { id: string; colors: string[] };
/** An avatar's settings: the part in each slot. */
export type Avatar = Partial<Record<Slot, Choice>>;

/** The text is not an avatar's string in a format this library reads. */
export class AvatarStringError extends Error {
  override name = "AvatarStringError";
}

const GRAMMAR = /^v(\d+)((?:\.[a-z][a-z0-9]*(?:-[0-9a-f]{6})*)*)$/;
const ID = /^[a-z][a-z0-9]*$/;
const COLOR = /^[0-9a-f]{6}$/;

/** A part with the colours given for it, and its own for those not given. */
const choiceOf = (part: Part, colors: readonly string[] = []): Choice => ({
  id: part.id,
  colors: part.colors.map((color, i) => colors[i] ?? color),
});

/** The plain avatar's part for a slot, for the slots every avatar fills. */
const baseOf = (slot: Slot): Choice | undefined => {
  const part = BASE[slot];
  return part && choiceOf(part);
};

/** The settings a string names. `v1` alone is the plain avatar: a face and eyes. */
export function parseAvatar(text: string): Avatar {
  const match = GRAMMAR.exec(text);
  if (!match) throw new AvatarStringError(`Not an avatar string: ${JSON.stringify(text)}`);
  if (match[1] !== "1")
    throw new AvatarStringError(`An avatar string in format v${match[1]}, which is not read here`);
  const avatar: Avatar = {};
  for (const item of (match[2] ?? "").split(".").slice(1)) {
    const [id = "", ...colors] = item.split("-");
    const part = partOf(id);
    if (part) avatar[part.slot] = choiceOf(part, colors);
  }
  for (const slot of SLOTS) {
    const base = !avatar[slot] && baseOf(slot);
    if (base) avatar[slot] = base;
  }
  return avatar;
}

/** The one string for these settings: its parts in the slots' order, each with every colour. */
export function formatAvatar(avatar: Avatar): string {
  const items = SLOTS.flatMap((slot) => {
    const given = avatar[slot];
    const part = given && partOf(given.id);
    const choice = part ? choiceOf(part, given.colors) : (given ?? baseOf(slot));
    if (!choice) return [];
    if (!ID.test(choice.id)) throw new AvatarStringError(`Not a part's id: "${choice.id}"`);
    for (const color of choice.colors)
      if (!COLOR.test(color)) throw new AvatarStringError(`Not a colour: "${color}"`);
    return [[choice.id, ...choice.colors].join("-")];
  });
  return ["v1", ...items].join(".");
}
