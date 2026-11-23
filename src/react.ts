// The live avatar as a React component.
import { createElement, useLayoutEffect, useRef } from "react";
import { type Mounted, mount, type Options } from "./live.ts";

/** A live avatar from a string or a seed. It takes what `mount` takes, and a class for the
 * element it is drawn in. */
export function Avatar({ className, ...options }: Options & { className?: string }) {
  const host = useRef<HTMLSpanElement>(null);
  const mounted = useRef<Mounted | null>(null);
  const { value, seed, size, still, look, state, label } = options;
  const [lookX, lookY] = [look?.x, look?.y];
  useLayoutEffect(() => {
    const next = {
      value,
      seed,
      size,
      still,
      look: lookX === undefined || lookY === undefined ? undefined : { x: lookX, y: lookY },
      state,
      label,
    };
    if (mounted.current) mounted.current.update(next);
    else if (host.current) mounted.current = mount(host.current, next);
  }, [value, seed, size, still, lookX, lookY, state, label]);
  useLayoutEffect(
    () => () => {
      mounted.current?.remove();
      mounted.current = null;
    },
    [],
  );
  return createElement("span", {
    ref: host,
    className,
    style: { display: "inline-block", width: size, height: size, verticalAlign: "middle" },
  });
}
