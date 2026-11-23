export { toSvg } from "./draw.ts";
export { type Mounted, mount, type Options } from "./live.ts";
export type { Aim, State } from "./motion.ts";
export {
  face,
  type Layer,
  type OnFace,
  type Paint,
  type Part,
  type Path,
  type Point,
  type Shape,
  SLOTS,
  type Slot,
} from "./part.ts";
export { PARTS } from "./parts/index.ts";
export { avatarFromSeed } from "./seed.ts";
export {
  type Avatar,
  AvatarStringError,
  type Choice,
  formatAvatar,
  parseAvatar,
} from "./string.ts";
