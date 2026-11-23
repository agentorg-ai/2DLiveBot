// The catalog: every part an avatar's string can name. A part joins it by being listed here.
import type { Part, Slot } from "../part.ts";
import { dot } from "./eyes/dot.ts";
import { bun } from "./face/bun.ts";
import { pebble } from "./face/pebble.ts";
import { round } from "./face/round.ts";

export const PARTS: readonly Part[] = [round, bun, pebble, dot];

const byId = new Map(PARTS.map((part) => [part.id, part]));
export const partOf = (id: string): Part | undefined => byId.get(id);

/** The plain avatar: the slots every avatar fills, each with the part it has when its string
 * names none. */
export const BASE: Partial<Record<Slot, Part>> = { face: round, eyes: dot };
