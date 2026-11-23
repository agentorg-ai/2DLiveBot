// An avatar for anything with a name: the same seed makes the same avatar's string, so an agent
// has a face before anyone chooses one.
import { hash, random } from "./hash.ts";
import { SLOTS, type Slot } from "./part.ts";
import { type Avatar, formatAvatar } from "./string.ts";

/** What a seed chooses among in a slot: the parts, where a part listed twice is twice as likely
 * and `null` leaves the slot empty, and the colours for each colour a part takes. A seed's
 * avatar changes when its slot's row here does, so a row is added to, not reordered. */
const CHOICES: Record<Slot, { parts: readonly (string | null)[]; colors: readonly string[][] }> = {
  // The lightest skin a seed draws still holds its edge on a light page.
  face: {
    parts: ["round"],
    colors: [["f4d6b8", "e9c09c", "d2a078", "ab7852", "80533a"]],
  },
  eyes: { parts: ["dot"], colors: [["2a2530", "2a2530", "3b2a22", "27364d"]] },
  // One head in twelve is bald, and one in six is bald over the crown. The darkest hair is a soft
  // black, which still shows on a dark page.
  hair: {
    parts: [
      ...["waves", "waves", "waves", "mane", "mane", "mane"],
      ...["sweep", "sweep", "sweep", "sides", "sides", null],
    ],
    colors: [
      [
        ...["453c4d", "4a3128", "5b3a2c", "7a4a35", "9a4b2e", "c2703d"],
        ...["d9a85b", "e6cf9a", "9d99a4", "5d6f8e", "b5687a"],
      ],
    ],
  },
  // Three avatars in ten wear glasses.
  eyewear: {
    parts: ["specs", "specs", "specs", null, null, null, null, null, null, null],
    colors: [["2a2530", "2a2530", "7a4a35", "7d2f3a", "2f4468"]],
  },
};

/** The nearest a part's colour may come to the skin's, as the distance between the two as red,
 * green and blue. Nearer than this, hair or a frame is hard to tell from the face. */
const CLEAR = 64;

const apart = (a: string, b: string) =>
  Math.hypot(
    ...[0, 2, 4].map((i) => parseInt(a.slice(i, i + 2), 16) - parseInt(b.slice(i, i + 2), 16)),
  );

/** The string of the avatar a seed makes. Each slot is chosen from the seed and the slot's own
 * name, so what one slot offers never changes another slot's choice. The one tie between slots
 * is the skin, the face's first colour: a colour drawn too near it gives way to the next in its
 * row that is clear of it. */
export function avatarFromSeed(seed: string): string {
  const avatar: Avatar = {};
  let skin: string | undefined;
  for (const slot of SLOTS) {
    const row = CHOICES[slot];
    const next = random(hash(`${slot}:${seed}`));
    const id = row.parts[Math.floor(next() * row.parts.length)];
    // Every colour is drawn whether or not a part is, so a part a row gains keeps the others'.
    const drawn = row.colors.map((list) => {
      const first = Math.floor(next() * list.length);
      const turn = list.map((_, i) => list[(first + i) % list.length] as string);
      return turn.find((color) => !skin || apart(color, skin) >= CLEAR) ?? (turn[0] as string);
    });
    if (slot === "face") skin = drawn[0];
    if (id) avatar[slot] = { id, colors: drawn };
  }
  return formatAvatar(avatar);
}
