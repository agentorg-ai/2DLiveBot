// The catalog: every part an avatar's string can name. A part joins it by being listed here.
import type { Part, Slot } from "../part.ts";
import { dot } from "./eyes/dot.ts";
import { round } from "./face/round.ts";
import { buzz } from "./hair/buzz.ts";
import { mane } from "./hair/mane.ts";
import { mohican } from "./hair/mohican.ts";
import { sides } from "./hair/sides.ts";
import { sweep } from "./hair/sweep.ts";
import { waves } from "./hair/waves.ts";

export const PARTS: readonly Part[] = [round, dot, waves, mane, sweep, buzz, mohican, sides];

const byId = new Map(PARTS.map((part) => [part.id, part]));
export const partOf = (id: string): Part | undefined => byId.get(id);

/** The plain avatar: the slots every avatar fills, each with the part it has when its string
 * names none. */
export const BASE: Partial<Record<Slot, Part>> = { face: round, eyes: dot };
