# 2DLiveBot

Animated character avatars for the web, drawn flat. An avatar is a soft, wide head with two dot
eyes. One string holds every setting of an avatar, and mounting that string in a page makes the
avatar live: it breathes, blinks, looks about, turns its head and follows the pointer.

The library has no dependencies and loads nothing: every drawing is in its code. It builds its
SVG with DOM calls and moves it through SVG attributes, so it works under a content policy that
allows neither inline styles nor code from text.

This is a prototype of the face and the eyes alone, to settle how they look and move before
hair, clothes and accessories are drawn onto them. It is not on npm yet.

## The avatar's string

```
v1.round-f7e3cf.dot-2a2530
```

`v1` is the format. Each part follows a dot: its id, then each of its colours after a hyphen, as
six lowercase hex digits. The text uses only lowercase letters, digits, dots and hyphens, so it
goes into a URL, a JSON value or a file name as it is.

- `v1` alone is the plain avatar: the face and eyes, each in its own colour.
- An avatar has one part in each slot: `face`, `eyes`. A later part in a slot replaces an
  earlier one. A new slot joins at the end.
- `formatAvatar` writes the one string for an avatar: its parts in the slots' order, each with
  every colour. A string written by hand may leave colours out and list parts in any order.
- A string keeps drawing the same avatar: a part's id and drawing are permanent, and its colours
  are in the string.
- A part the catalog doesn't have is passed over, and a colour beyond those a part takes is
  ignored, so a string made with a later catalog still draws with an earlier one.

## Use

```ts
import { avatarFromSeed, mount, toSvg } from "2dlivebot";

// Live, in an element. The avatar of a seed, such as an agent's id, is always the same.
const avatar = mount(element, { seed: agent.id, size: 40 });
avatar.update({ value: "v1.bun-e9c09c.dot-2a2530", size: 40 });
avatar.remove();

// Still, as SVG text: for an image, a file, or a page made on a server.
image.src = `data:image/svg+xml,${encodeURIComponent(toSvg(avatarFromSeed(agent.id)))}`;
```

```tsx
import { Avatar } from "2dlivebot/react";

<Avatar seed={agent.id} size={40} state="working" label={agent.name} />;
```

`mount` and `Avatar` take the same options:

| Option  | What it sets                                                                             |
| ------- | ---------------------------------------------------------------------------------------- |
| `value` | The avatar's string. Text that is not one draws the plain avatar.                        |
| `seed`  | What to make the avatar from when there is no string.                                    |
| `size`  | Its width and height in CSS pixels. Without one it fills the element it is in.           |
| `still` | Stand still: as drawn, or turned the way `look` says.                                    |
| `look`  | Where it looks, `{ x, y }` from -1 to 1, right and down. Without one it looks by itself. |
| `state` | `"idle"`, `"working"` (reading something below it) or `"asleep"` (eyes closed).          |
| `label` | What a screen reader calls it. Without one it is hidden from screen readers.             |

A live avatar stops by itself while it is off screen, and stands still for a person who asks for
reduced motion. All the avatars in a page share one clock, which moves them 30 times a second and
gives an avatar a new position only when it would move a quarter of a screen pixel.

`parseAvatar` reads a string into its settings and throws `AvatarStringError` for text that is
not one; `formatAvatar` writes settings back. `PARTS` and `SLOTS` list the catalog, for an editor.

## How it moves

The drawing is flat, and the head turns all the same. The face is treated as the front of a
ball. When the head turns, what has a place on the face travels round the ball: it goes toward
the side the head turns to, slows as it nears the edge, and is drawn narrower there. The two
eyes are two such marks, so in a turn the eye ahead closes on the edge and thins while the one
behind crosses the middle of the face. The head's outline shifts and leans a little the same way.

The eyes look first and the head follows most of the way on a spring, going a little past and
settling. The head stretches up as it breathes in and dips when it starts to turn. A blink
closes each eye onto its own place.

## Parts

A part is one file under `src/parts/<slot>/`, listed in `src/parts/index.ts`. It has an id, a
slot, the colours it takes with their defaults, and layers. A layer is a list of flat SVG paths
in a 100 by 100 drawing space, and says how it moves:

- `z`: its place in the paint order, from `Z` in `src/part.ts`.
- `on`: what carries it. The `head` shifts, tilts and breathes; the `eyes` ride the head, look
  about by themselves and close in a blink.
- `at`: its place on the face, which it keeps as the head turns, as above. A layer without one
  is the head's outline.

A shape is painted with one of its part's colours by position (`"0"`, `"1"`).

Every drawing in the catalog is original to this repository.

## Develop

```
npm ci
npm run build
npm test
npm run check
```

`npm run demo` builds the demo page and serves it at http://localhost:7745: an editor with the face shapes, the colours and where
the avatar looks, a sheet of the head turned each way, and avatars from seeds. `?many=50` shows
that many avatars and nothing else. `npm run demo -- --build` builds the page into `dist/page`
and stops.

## License

MIT. See [LICENSE](LICENSE).
