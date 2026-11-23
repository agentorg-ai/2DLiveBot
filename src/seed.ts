// An avatar for anything with a name: the same seed makes the same avatar's string, so an agent
// has a face before anyone chooses one.
import { hash, random } from "./hash.ts";
import { SLOTS, type Slot } from "./part.ts";
import { type Avatar, formatAvatar } from "./string.ts";

/** What a seed chooses among in a slot: the parts, where a part listed twice is twice as likely
 * and `null` leaves the slot empty, and the colours for each colour a part takes. A slot with
 * no row is left empty. A seed's avatar changes when its slot's row here does, so a row is
 * added to, not reordered. */
const CHOICES: Partial<
  Record<Slot, { parts: readonly (string | null)[]; colors: readonly string[][] }>
> = {
  face: {
    parts: ["round"],
    colors: [["f7e3cf", "f4d6b8", "e9c09c", "d2a078", "ab7852", "80533a"]],
  },
  eyes: { parts: ["dot"], colors: [["2a2530"]] },
};

/** The string of the avatar a seed makes. Each slot is chosen from the seed and the slot's own
 * name, so what one slot offers never changes another slot's choice. */
export function avatarFromSeed(seed: string): string {
  const avatar: Avatar = {};
  for (const slot of SLOTS) {
    const row = CHOICES[slot];
    if (!row) continue;
    const next = random(hash(`${slot}:${seed}`));
    const pick = <T>(list: readonly T[]) => list[Math.floor(next() * list.length)] as T;
    const id = pick(row.parts);
    // Every colour is drawn whether or not a part is, so a part a row gains keeps the others'.
    const drawn = row.colors.map(pick);
    if (id) avatar[slot] = { id, colors: drawn };
  }
  return formatAvatar(avatar);
}
